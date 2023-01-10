import { Sequelize, Model, DataTypes } from "@sequelize/core";
import * as constants from "../constants";

// Create a new Sequelize instance that connects to a MySQL database
// using the configuration specified in the constants file.
export const sequelize = new Sequelize(constants.DB_DATABASE, constants.DB_USERNAME, constants.DB_PASSWORD, {
  // Use the MySQL dialect for this connection.
  dialect: "mariadb",
  // Connect to the database at the host specified in constants.
  host: constants.DB_HOST,
  // Use the port specified in constants for the connection.
  port: constants.DB_PORT,
});

// Define the Student model that extends Model from Sequelize.
export class Student extends Model {
  public id!: number;
  public timestamps!: string;
  public lastLogin!: number;
}

Student.init({
  // The id field is a small integer that is the primary key and must be unique.
  id: {
    type: DataTypes.SMALLINT,
    autoIncrement: false,
    primaryKey: true,
    unique: true,
  },
  // The timestamps field is a string of text and cannot be null.
  // It has a default value of an empty array represented as a string.
  timestamps: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "[]"
  },
  // The lastLogin field is a large integer and cannot be null.
  // It has a default value of 0.
  lastLogin: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  } 
}, {
  // Use the sequelize instance o connect the model to the database.
  sequelize,
  // Use the table name "student" for this model.
  tableName: "student",
  // Set timestamps to false so that Sequelize does not add timestamps fields to the model.
  timestamps: false,
});

// Asynchronously establish a connection to the database.
export async function connect() {
  try {
    // Try to authenticate the connection.
    await sequelize.authenticate().then(() => {
      // If the connection is successful, log a message.
      console.log("Connection has been established successfully.");
    });
  } catch (error) {
    // If an error occurs, log the error message.
    console.error("Unable to connect to the database:", error);
  }
}