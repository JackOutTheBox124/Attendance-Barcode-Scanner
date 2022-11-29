import { Sequelize, Model, DataTypes } from "@sequelize/core";
import * as constants from "../constants";

export const sequelize = new Sequelize(constants.DB_DATABASE, constants.DB_USERNAME, constants.DB_PASSWORD, {
  dialect: "mysql",
  host: constants.DB_HOST,
  port: constants.DB_PORT,
});

export class Student extends Model {
  public id!: number;
  public timestamps!: string;
  public lastLogin!: number;
}

Student.init({
  id: {
    type: DataTypes.SMALLINT,
    autoIncrement: false,
    primaryKey: true,
    unique: true,
  },
  timestamps: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "[]"
  },
  lastLogin: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: "student",
  timestamps: false,
});

export async function connect() {
  try {
    await sequelize.authenticate().then(() => {
      console.log("Connection has been established successfully.");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}