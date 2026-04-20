import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      url: String,
      publicId: String,
      altText: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    meta: {
      title: String,
      description: String,
      keywords: [String],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.pre("save", async function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
});

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for products
categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
});

// Virtual for active products count
categorySchema.virtual("activeProductsCount").get(async function () {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({
    category: this._id,
    isActive: true,
  });
  return count;
});

// Virtual for subcategories count
categorySchema.virtual("subcategoriesCount").get(async function () {
  const count = await mongoose.models.Category.countDocuments({
    parent: this._id,
    isActive: true,
  });
  return count;
});

// Method to increment product count
categorySchema.methods.incrementProductCount = function (count = 1) {
  this.productCount += count;
  return this.save();
};

// Method to decrement product count
categorySchema.methods.decrementProductCount = function (count = 1) {
  this.productCount = Math.max(0, this.productCount - count);
  return this.save();
};

// Method to reset product count
categorySchema.methods.resetProductCount = async function () {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({
    category: this._id,
    isActive: true,
  });
  this.productCount = count;
  return this.save();
};

// Method to update product count from actual database count
categorySchema.methods.updateProductCountFromDB = async function () {
  const Product = mongoose.model("Product");
  const activeProductCount = await Product.countDocuments({
    category: this._id,
    isActive: true,
  });

  this.productCount = activeProductCount;
  return this.save();
};

// Method to get full category path (breadcrumb)
categorySchema.methods.getCategoryPath = async function () {
  const path = [];

  const addToPath = async (categoryId) => {
    const category = await mongoose.models.Category.findById(categoryId);
    if (category) {
      path.unshift({
        _id: category._id,
        name: category.name,
        slug: category.slug,
      });

      if (category.parent) {
        await addToPath(category.parent);
      }
    }
  };

  await addToPath(this._id);
  return path;
};

// Method to check if category is a descendant of another category
categorySchema.methods.isDescendantOf = async function (parentCategoryId) {
  if (this.parent && this.parent.toString() === parentCategoryId.toString()) {
    return true;
  }

  if (!this.parent) {
    return false;
  }

  const parentCategory = await mongoose.models.Category.findById(this.parent);
  if (!parentCategory) {
    return false;
  }

  return parentCategory.isDescendantOf(parentCategoryId);
};

// Method to get all descendant categories (recursive)
categorySchema.methods.getAllDescendants = async function (
  includeSelf = false,
) {
  const descendants = includeSelf ? [this] : [];

  const getDescendants = async (categoryId) => {
    const children = await mongoose.models.Category.find({
      parent: categoryId,
      isActive: true,
    });

    for (const child of children) {
      descendants.push(child);
      await getDescendants(child._id);
    }
  };

  await getDescendants(this._id);
  return descendants;
};

// Method to get all ancestor categories
categorySchema.methods.getAllAncestors = async function (includeSelf = false) {
  const ancestors = includeSelf ? [this] : [];

  const getAncestors = async (categoryId) => {
    const category = await mongoose.models.Category.findById(categoryId);
    if (category && category.parent) {
      const parent = await mongoose.models.Category.findById(category.parent);
      if (parent) {
        ancestors.unshift(parent);
        await getAncestors(parent._id);
      }
    }
  };

  await getAncestors(this._id);
  return ancestors;
};

// Method to move category to new parent
categorySchema.methods.moveToParent = async function (newParentId) {
  // Check if new parent is valid
  if (newParentId && newParentId.toString() === this._id.toString()) {
    throw new Error("Category cannot be its own parent");
  }

  // Check if new parent is a descendant (would create circular reference)
  if (newParentId) {
    const isDescendant = await this.isDescendantOf(newParentId);
    if (isDescendant) {
      throw new Error("Cannot move category to its descendant");
    }

    const newParent = await mongoose.models.Category.findById(newParentId);
    if (!newParent) {
      throw new Error("New parent category not found");
    }
  }

  this.parent = newParentId || null;
  return this.save();
};

// Method to toggle featured status
categorySchema.methods.toggleFeatured = function () {
  this.featured = !this.featured;
  return this.save();
};

// Method to toggle active status
categorySchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

// Method to update sort order
categorySchema.methods.updateSortOrder = function (newOrder) {
  this.sortOrder = newOrder;
  return this.save();
};

// Static method to update product count for a category
categorySchema.statics.updateProductCount = async function (
  categoryId,
  change = 1,
) {
  return this.findByIdAndUpdate(
    categoryId,
    { $inc: { productCount: change } },
    { new: true },
  );
};

// Static method to get root categories (no parent)
categorySchema.statics.getRootCategories = function () {
  return this.find({
    parent: null,
    isActive: true,
  }).sort("sortOrder");
};

// Static method to get featured categories
categorySchema.statics.getFeaturedCategories = function (limit = 10) {
  return this.find({
    featured: true,
    isActive: true,
  })
    .sort("sortOrder")
    .limit(limit);
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function (
  parentId = null,
  depth = 0,
  maxDepth = 3,
) {
  if (depth >= maxDepth) return [];

  const categories = await this.find({
    parent: parentId,
    isActive: true,
  }).sort("sortOrder");

  const tree = await Promise.all(
    categories.map(async (category) => {
      const children = await this.getCategoryTree(
        category._id,
        depth + 1,
        maxDepth,
      );
      return {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        productCount: category.productCount,
        featured: category.featured,
        sortOrder: category.sortOrder,
        children,
        depth,
      };
    }),
  );

  return tree;
};

// Static method to find category by slug
categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

// Static method to search categories
categorySchema.statics.searchCategories = function (searchTerm, limit = 20) {
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
    ],
    isActive: true,
  })
    .limit(limit)
    .sort("name");
};

// Static method to get category statistics
categorySchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: { $sum: { $cond: ["$isActive", 1, 0] } },
        featuredCategories: { $sum: { $cond: ["$featured", 1, 0] } },
        rootCategories: {
          $sum: {
            $cond: [
              { $or: [{ $eq: ["$parent", null] }, { $not: "$parent" }] },
              1,
              0,
            ],
          },
        },
        subcategories: {
          $sum: {
            $cond: [{ $and: ["$parent", { $ne: ["$parent", null] }] }, 1, 0],
          },
        },
        totalProductCount: { $sum: "$productCount" },
        avgProductsPerCategory: { $avg: "$productCount" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalCategories: 0,
      activeCategories: 0,
      featuredCategories: 0,
      rootCategories: 0,
      subcategories: 0,
      totalProductCount: 0,
      avgProductsPerCategory: 0,
    }
  );
};

// Static method to bulk update categories
categorySchema.statics.bulkUpdate = async function (categoryIds, updateData) {
  return this.updateMany({ _id: { $in: categoryIds } }, updateData, {
    runValidators: true,
  });
};

// Static method to fix all category product counts (useful for maintenance)
categorySchema.statics.fixAllProductCounts = async function () {
  const categories = await this.find({});
  const Product = mongoose.model("Product");

  for (const category of categories) {
    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    if (category.productCount !== productCount) {
      category.productCount = productCount;
      await category.save();
    }
  }

  return { message: "All category product counts have been fixed" };
};

// Indexes for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ featured: 1, isActive: 1 });
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ productCount: -1 });
categorySchema.index({ createdAt: -1 });
categorySchema.index({ updatedAt: -1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
