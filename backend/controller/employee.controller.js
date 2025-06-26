import { Employee } from "../model/model.js";
import { Op } from "sequelize";
export const createEMP = async (req, res) => {
  try {
    const { name, department, position, email, salary } = req.body;
    if (!name || !department || !position || !email || !salary) {
      return res.status(400).json({
        success: false,
        message: "please give all required fields",
      });
    }
    const exist = await Employee.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "employee with this email already exists",
      });
    }
    const savedEMP = await Employee.create({
      name,
      department,
      position,
      email,
      salary,
    });

    res.status(201).json({
      success: true,
      data: savedEMP,
      message: "employee created",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const AllEMP = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      sortBy = "name",
      order = "asc",
      name,
      department,
      position,
    } = req.query;

    const offset = (page - 1) * limit;
    //! why are we doing this
    //! This is done to calculate the starting point for the records to fetch
    //! For example, if page = 2 and limit = 5, we want to skip the first 5 records
    //! so we set offset = 5

    const filterBOX = {};
    if (name) filterBOX.name = { [Op.like]: `%${name}%` };
    if (department) filterBOX.department = department;
    if (position) filterBOX.position = position;

    //!https://sequelize.org/docs/v7/querying/operators/
    const { count, rows: employees } = await Employee.findAndCountAll({
      where: filterBOX,
      order: [[sortBy, order.toUpperCase()]], //* SARE SAME SAME HOJAYEGE
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      data: employees,
    });
  } catch (error) {
    console.error("Error in AllEMP:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const findEMPbyID = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "employee not found" });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEMP = async (req, res) => {
  try {
    const [updated] = await Employee.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }
    const employee = await Employee.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: employee,
      message: "employee updated",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEMP = async (req, res) => {
  try {
    const deleted = await Employee.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "employee deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const filterOpts = async (req, res) => {
  try {
  
    const employees = await Employee.findAll({
      attributes : ["department", "position"],
    });
    const departments = [
      ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
    ];
    const positions = [
      ...new Set(employees.map((emp) => emp.position).filter(Boolean)),
    ];
    //!unique departments and positions NOT UNDEFINED OR NULL 
    res.status(200).json({
      success: true,
      departments,
      positions,
    });
  } catch (error) {
    console.error("Error getting filter options:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
