import { toast } from "react-toastify";

class OrderService {
  constructor() {
    this.tableName = 'order_c';
    this.initializeClient();
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async createOrder(orderData) {
    try {
      const orderNumber = this.generateOrderNumber();
      
      const dbOrder = {
        Name: `Order ${orderNumber}`,
        items_c: JSON.stringify(orderData.items),
        total_amount_c: orderData.totalAmount,
        shipping_address_c: JSON.stringify(orderData.shippingAddress),
        payment_method_c: orderData.paymentMethod,
        order_date_c: new Date().toISOString(),
        status_c: "confirmed",
        order_number_c: orderNumber
      };

      const params = {
        records: [dbOrder]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error("Failed to create order");
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} orders: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create order");
        }
        
        if (successful.length > 0) {
          const createdOrder = successful[0].data;
          return this.transformFromDatabase(createdOrder);
        }
      }

      throw new Error("Failed to create order");
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "shipping_address_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "order_number_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Order with ID ${id} not found`);
      }

      return this.transformFromDatabase(response.data);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw new Error(`Order with ID ${id} not found`);
    }
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "shipping_address_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "order_number_c"}}
        ],
        orderBy: [{"fieldName": "order_date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(order => this.transformFromDatabase(order));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `TG${timestamp.slice(-6)}${random}`;
  }

  transformFromDatabase(dbOrder) {
    return {
      Id: dbOrder.Id,
      items: dbOrder.items_c ? JSON.parse(dbOrder.items_c) : [],
      totalAmount: parseFloat(dbOrder.total_amount_c) || 0,
      shippingAddress: dbOrder.shipping_address_c ? JSON.parse(dbOrder.shipping_address_c) : {},
      paymentMethod: dbOrder.payment_method_c || "",
      orderDate: dbOrder.order_date_c || new Date().toISOString(),
      status: dbOrder.status_c || "pending",
      orderNumber: dbOrder.order_number_c || ""
    };
  }
}

export default new OrderService();