const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config()

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  ssl: {
    rejectUnauthorized: true,  
  }
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
  });

  function query(sql, params) {
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  async function itemExists(tableName, columnName, value) {
    try {
      const querySQL = `SELECT COUNT(*) AS count FROM ?? WHERE ?? = ?`;
      const results = await query(querySQL, [tableName, columnName, value]);
      return results[0].count > 0;
    } catch (error) {
      console.error(`Error checking existence of item in ${tableName}.${columnName}:`, error.message);
      return false;  
    }
  }
  
  async function insertUser(username, email, password, name, contactInfo, role) {
    try {
      const insertQuery = `
        INSERT INTO user (username, email, password, name, contact_info, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [username, email, password, name, contactInfo, role];
      const result = await query(insertQuery, values);
      return result.insertId; 
    } catch (error) {
      console.error('Error inserting user:', error.message);
      return null;  
    }
  }
  
  async function assignAdministrator(userId) {
    try {
      const exists = await itemExists("user", "user_id", userId);
      if (!exists) {
        console.error(`User with ID ${userId} does not exist`);
        return null;  
      }
  
      const insertAdminQuery = `INSERT INTO administrator (user_id) VALUES (?)`;
      const result = await query(insertAdminQuery, [userId]);
      return result.insertId;
    } catch (error) {
      console.error(`Error assigning administrator role to user ID ${userId}:`, error.message);
      return null;  
    }
  }
  
  async function assignModerator(userId) {
    try {
      const exists = await itemExists("user", "user_id", userId);
      if (!exists) {
        console.error(`User with ID ${userId} does not exist`);
        return null;  
      }
  
      const insertModeratorQuery = `INSERT INTO moderator (user_id) VALUES (?)`;
      const result = await query(insertModeratorQuery, [userId]);
      return result.insertId;
    } catch (error) {
      console.error(`Error assigning moderator role to user ID ${userId}:`, error.message);
      return null;   
    }
  }

  async function insertCategory(name, description, parentCategory, assignByModerator, assignByUser) {
    try {
      if(assignByModerator){//OTDO is moderator
        const exists = await itemExists("user", "user_id", assignByModerator);
        if (!exists) {
          console.error(`User with ID ${assignByModerator} does not exist`);
          return null;  
        }
      }
      else if(assignByUser){
        const exists = await itemExists("user", "user_id", assignByUser);
        if (!exists) {
          console.error(`User with ID ${assignByUser} does not exist`);
          return null;  
        }
      }
      else{
        console.error(`Category mast be assign by moderator or by registered user`);
        return null;
      }

      if(parentCategory){
        const exists = await itemExists("category", "category_id", parentCategory);
        if (!exists) {
          console.error(`Category with ID ${parentCategory} does not exist`);
          return null;  
        }
      }
  
      const insertCategoryQuery = `INSERT INTO category (name, description, parent_category_id, assigned_by_moderator_id, suggested_by_user_id)
      VALUES (?, ?, ?, ?, ?)`;
      const result = await query(insertCategoryQuery, [name, description, parentCategory, assignByModerator, assignByUser]);
      return result.insertId;
    } catch (error) {
      console.error(`Error inserting category:`, error.message);
      return null;   
    }
  }
  //TODO insert insert order/ review /self-harm/ 
  async function insertProduct(name, description, categoryId){
    try{
      const exists = await itemExists("category", "category_id", categoryId);
      if (!exists) {
        console.error(`Category with ID ${categoryId} does not exist`);
        return null;  
      }
    
      const insertProductQuery = `INSERT INTO products (name, description, category_id)
      VALUES (?, ?, ?)`;
      const result = await query(insertProductQuery, [name, description, categoryId]);
      return result.insertId;
    } catch(error){
      console.error(`Error inserting product:`, error.message);
      return null;
    }   
  }

  async function insertOffer(productId, userId, price, quantity, status, is_pickable){
    try{
      const existsProduct = await itemExists("products", "product_id", productId);
      if (!existsProduct) {
        console.error(`Product with ID ${productId} does not exist`);
        return false;  
      }

      const existsUser = await itemExists("registered_user", "user_id", userId);
      if (!existsUser) {
        console.error(`User with ID ${userId} does not exist`);
        return false;  
      }
    
      const insertOfferQuery = `INSERT INTO offer (product_id, user_id, price, quantity, status, is_pickable)
      VALUES (?, ?, ?, ?, ?, ?)`;
      const result = await query(insertOfferQuery, [productId, userId, price, quantity, status, is_pickable]);
      return result.affectedRows > 0;
    } catch(error){
      console.error(`Error inserting offer:`, error.message);
      return false;
    }   
  }

  async function insertOrder(customerId, totalAmount) {
    try{
      const existsCustomer = await itemExists("registered_user", "user_id", customerId);
      if (!existsCustomer) {
        console.error(`Customer with ID ${customerId} does not exist`);
        return null;  
      }
      const insertOrderQuery = `
        INSERT INTO orders (customer_id, order_date, total_amount)
        VALUES (?, NOW(), ?)
      `;
      const result = await query(insertOrderQuery, [customerId, totalAmount]);
      
      return result.insertId;  
    } catch (error) {
      console.error(`Error inserting order:`, error.message);
      return null;   
    }
  }

  async function registerUser(userId, isFarmer){
    try {
      const exists = await itemExists("user", "user_id", userId);
      if (!exists) {
        console.error(`User with ID ${userId} does not exist`);
        return null;  
      }
  
      const registerUserQuery = `INSERT INTO registered_user (user_id, is_farmer, is_customer) VALUES (?, ?, ?)`;
      const result = await query(registerUserQuery, [userId, isFarmer, 1]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error register user with ID ${userId}:`, error.message);
      return false;   
    }
  }
  
  async function getItemByColumn(tableName, columnName, columnValue) {
    try {
      const querySQL = `SELECT * FROM ?? WHERE ?? = ?`;
      const results = await query(querySQL, [tableName, columnName, columnValue]);
      return results;
    } catch (error) {
      console.error(`Error retrieving items from ${tableName} by ${columnName} = ${columnValue}:`, error.message);
      return null;   
    }
  }

  async function deleteItem(tableName, columnName, value) {
    try {
      const exists = await itemExists(tableName, columnName, value);
      if (!exists) {
        console.error(`Item with ${value} does not exist`);
        return null;  
      }
      const deleteQuery = `DELETE FROM ?? WHERE ?? = ?`;
      const result = await query(deleteQuery, [tableName, columnName, value]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error.message);
      return false;  
    }
  }

  async function updateItemColumnById(tableName, columnName, value, nameOfId, id) {
    try {
      const updateSQL = `UPDATE ?? SET ?? = ? WHERE ?? = ?`;
      const result = await query(updateSQL, [tableName, columnName, value, nameOfId, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating ${columnName} in ${tableName}:`, error.message);
      return false;
    }
  }
  
  function closeConnection() {
    connection.end((err) => {
      if (err) {
        console.error('Error closing the database connection:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
  
  module.exports = {
    itemExists,
    insertUser,
    assignAdministrator,
    assignModerator,
    insertCategory,
    insertProduct,
    insertOffer,
    insertOrder,
    registerUser,
    getItemByColumn,
    deleteItem,
    updateItemColumnById,
    closeConnection,
  };