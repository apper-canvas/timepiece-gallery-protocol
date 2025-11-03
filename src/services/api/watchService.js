import { toast } from "react-toastify";

class WatchService {
  constructor() {
    this.tableName = 'watch_c';
    this.initializeClient();
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll(filters = {}) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "movement_c"}},
          {"field": {"Name": "case_size_c"}},
          {"field": {"Name": "case_material_c"}},
          {"field": {"Name": "strap_material_c"}},
          {"field": {"Name": "water_resistance_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "specifications_c"}}
        ],
        where: [],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        params.where.push({
          "FieldName": "category_c",
          "Operator": "ExactMatch",
          "Values": filters.categories,
          "Include": true
        });
      }

      // Apply brand filter
      if (filters.brands && filters.brands.length > 0) {
        params.where.push({
          "FieldName": "brand_c",
          "Operator": "ExactMatch",
          "Values": filters.brands,
          "Include": true
        });
      }

      // Apply price range filter
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        params.where.push({
          "FieldName": "price_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [min.toString()],
          "Include": true
        });
        params.where.push({
          "FieldName": "price_c",
          "Operator": "LessThanOrEqualTo",
          "Values": [max.toString()],
          "Include": true
        });
      }

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search;
        params.whereGroups = [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "brand_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "model_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "category_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "description_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            }
          ]
        }];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data.map(watch => this.transformFromDatabase(watch));
    } catch (error) {
      console.error("Error fetching watches:", error);
      toast.error("Failed to fetch watches");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "movement_c"}},
          {"field": {"Name": "case_size_c"}},
          {"field": {"Name": "case_material_c"}},
          {"field": {"Name": "strap_material_c"}},
          {"field": {"Name": "water_resistance_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "specifications_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(`Watch with ID ${id} not found`);
      }

      return this.transformFromDatabase(response.data);
    } catch (error) {
      console.error(`Error fetching watch ${id}:`, error);
      throw new Error(`Watch with ID ${id} not found`);
    }
  }

  async getByCategory(category) {
    return this.getAll({ categories: [category] });
  }

  async getFeatured(limit = 4) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "movement_c"}},
          {"field": {"Name": "case_size_c"}},
          {"field": {"Name": "case_material_c"}},
          {"field": {"Name": "strap_material_c"}},
          {"field": {"Name": "water_resistance_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "specifications_c"}}
        ],
        orderBy: [{"fieldName": "price_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(watch => this.transformFromDatabase(watch));
    } catch (error) {
      console.error("Error fetching featured watches:", error);
      return [];
    }
  }

  async searchWatches(query) {
    if (!query || query.trim() === "") {
      return [];
    }
    return this.getAll({ search: query.trim() });
  }

  async getRelated(watchId, limit = 4) {
    try {
      const currentWatch = await this.getById(watchId);
      if (!currentWatch) return [];

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "movement_c"}},
          {"field": {"Name": "case_size_c"}},
          {"field": {"Name": "case_material_c"}},
          {"field": {"Name": "strap_material_c"}},
          {"field": {"Name": "water_resistance_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "specifications_c"}}
        ],
        where: [
          {
            "FieldName": "category_c",
            "Operator": "EqualTo",
            "Values": [currentWatch.category],
            "Include": true
          },
          {
            "FieldName": "brand_c",
            "Operator": "NotEqualTo",
            "Values": [currentWatch.brand],
            "Include": true
          }
        ],
        pagingInfo: {"limit": limit, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        return [];
      }

      return response.data
        .filter(watch => watch.Id !== parseInt(watchId))
        .map(watch => this.transformFromDatabase(watch));
    } catch (error) {
      console.error("Error fetching related watches:", error);
      return [];
    }
  }

  async getInStock() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "movement_c"}},
          {"field": {"Name": "case_size_c"}},
          {"field": {"Name": "case_material_c"}},
          {"field": {"Name": "strap_material_c"}},
          {"field": {"Name": "water_resistance_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "specifications_c"}}
        ],
        where: [
          {
            "FieldName": "in_stock_c",
            "Operator": "EqualTo",
            "Values": [true],
            "Include": true
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        return [];
      }

      return response.data.map(watch => this.transformFromDatabase(watch));
    } catch (error) {
      console.error("Error fetching in-stock watches:", error);
      return [];
    }
  }

  async getPriceRange() {
    try {
      const params = {
        fields: [{"field": {"Name": "price_c"}}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success || !response.data.length) {
        return { min: 0, max: 1000 };
      }

      const prices = response.data.map(watch => parseFloat(watch.price_c) || 0);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    } catch (error) {
      console.error("Error fetching price range:", error);
      return { min: 0, max: 1000 };
    }
  }

  async getCategories() {
    try {
      const params = {
        fields: [{"field": {"Name": "category_c"}}],
        groupBy: ["category_c"]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        return [];
      }

      return response.data
        .map(watch => watch.category_c)
        .filter(category => category)
        .sort();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async getBrands() {
    try {
      const params = {
        fields: [{"field": {"Name": "brand_c"}}],
        groupBy: ["brand_c"]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        return [];
      }

      return response.data
        .map(watch => watch.brand_c)
        .filter(brand => brand)
        .sort();
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  }

  transformFromDatabase(dbWatch) {
    return {
      Id: dbWatch.Id,
      brand: dbWatch.brand_c || "",
      model: dbWatch.model_c || "",
      price: parseFloat(dbWatch.price_c) || 0,
      category: dbWatch.category_c || "",
      images: dbWatch.images_c ? dbWatch.images_c.split('\n').filter(img => img.trim()) : [],
      movement: dbWatch.movement_c || "",
      caseSize: dbWatch.case_size_c || "",
      caseMaterial: dbWatch.case_material_c || "",
      strapMaterial: dbWatch.strap_material_c || "",
      waterResistance: dbWatch.water_resistance_c || "",
      description: dbWatch.description_c || "",
      inStock: dbWatch.in_stock_c || false,
      specifications: dbWatch.specifications_c ? JSON.parse(dbWatch.specifications_c) : {}
    };
  }
}

export default new WatchService();

export default new WatchService();