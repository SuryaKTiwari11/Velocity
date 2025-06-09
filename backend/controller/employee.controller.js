import Employee from "../model/employee.model.js";

export const createEMP = async (req, res) => {
  try {
    const { name, department, position, email, salary } = req.body;
    if (!name || !department || !position || !email || !salary) {
      return res.status(400).json({
        success: false,
        message: "please give all required fields",
      });
    }
    const exist = await Employee.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "employee with this email already exists",
      });
    }
    const newEMP = new Employee({
      name,
      department,
      position,
      email,
      salary,
    });
    const savedEMP = await newEMP.save();
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
    const employees = await Employee.find();
    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const findEMPbyID = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
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
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }
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
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
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
