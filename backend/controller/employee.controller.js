import { Employee } from "../model/index.js";

export const createEMP = async (req, res) => {
  try {
    const { name, department, position, email, salary } = req.body;
    if (!name || !department || !position || !email || !salary) {
      return res.status(400).json({
        success: false,
        message: "please give all required fields",
      });
    }

    // Check if employee exists with the same email
    const exist = await Employee.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "employee with this email already exists",
      });
    }

    // Create employee using Sequelize
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
    console.log("Fetching all employees, auth user:", req.user?.id);

    const employees = await Employee.findAll();
    console.log(`Found ${employees.length} employee records`);

    res.status(200).json({
      success: true,
      count: employees.length,
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
    //! NOT GONNA VALIDATE here cuz not all are required to be update
    // we only be called by the admin

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
