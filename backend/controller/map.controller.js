import { User, Employee } from "../model/model.js";
import { Op } from "sequelize";
import { cityCoordinates, getRegion } from "../constant/city.js";


export const getCities = async (req, res) => {

  try {
    res.status(200).json({
      success: true,
      cities: Object.keys(cityCoordinates).sort(),
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};
export const getData = async (req, res) => {
  try {
   
    const cityCounts = await User.findAll({
      attributes: [
        "city",
        [User.sequelize.fn("COUNT", User.sequelize.col("city")), "userCount"],
      ],
      where: { city: { [Op.not]: null } },
      group: ["city"],
      order: [[User.sequelize.literal("2"), "DESC"]], // order by userCount (2nd column)
      limit: 100,
      raw: true,
    });

    const totalUsers = cityCounts.reduce(
      (sum, c) => sum + Number(c.userCount),
      0
    );

    const locations = cityCounts.map(({ city, userCount }) => ({
      city,
      userCount: Number(userCount),
      percentage: ((userCount / totalUsers) * 100).toFixed(1),
      coordinates: cityCoordinates[city] || [20.5937, 78.9629],
    }));

    const summary = {
      totalUsers,
      totalCities: cityCounts.length,
      topCity: locations[0]?.city || "N/A",
    };

    res.json({
      success: true,
      data: { locations, summary },
    });
  } catch (error) {
    console.error("Get map data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get map data",
      error: error.message,
    });
  }
};
export const getUsersByCity = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "city"],
      where: { city: { [Op.not]: null } },
      include: [
        {
          model: Employee,
          attributes: ["position", "department"],
          required: false,
        },
      ],
      raw: true,
      nest: true,
    });

    // Group users by city
    const citiesData = {};
    users.forEach((user) => {
      const city = user.city;
      if (!citiesData[city]) {
        citiesData[city] = {
          city,
          coordinates: cityCoordinates[city] || [20.5937, 78.9629],
          users: [],
          userCount: 0,
        };
      }
      citiesData[city].users.push({
        id: user.id,
        name: user.name,
        email: user.email,
        position: user.Employee?.position || "Not assigned",
        department: user.Employee?.department || "Not assigned",
      });
      citiesData[city].userCount++;
    });

    res.json({
      success: true,
      data: Object.values(citiesData).sort((a, b) => b.userCount - a.userCount),
    });
  } catch (error) {
    console.error("Get users by city error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users by city",
      error: error.message,
    });
  }
};


export const getStats = async (req, res) => {
  try {
    const [totalUsers, usersWithLocation, states] = await Promise.all([
      User.count(),
      User.count({ where: { state: { [Op.not]: null } } }),
      User.findAll({
        attributes: [
          "state",
          [User.sequelize.fn("COUNT", User.sequelize.col("state")), "count"],
        ],
        where: { state: { [Op.not]: null } },
        group: ["state"],
        order: [[User.sequelize.literal("count"), "DESC"]],
        limit: 10,
        raw: true,
      }),
    ]);

    const regionStats = states.reduce((acc, state) => {
      const region = getRegion(state.state);
      acc[region] = (acc[region] || 0) + Number(state.count);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          usersWithLocation,
          locationCoverage: totalUsers
            ? ((usersWithLocation / totalUsers) * 100).toFixed(1)
            : "0.0",
          totalStates: states.length,
        },
        topStates: states.map((state) => ({
          state: state.state,
          userCount: Number(state.count),
          percentage: usersWithLocation
            ? ((state.count / usersWithLocation) * 100).toFixed(1)
            : "0.0",
        })),
        regionBreakdown: Object.entries(regionStats)
          .map(([region, count]) => ({
            region,
            userCount: count,
            percentage: usersWithLocation
              ? ((count / usersWithLocation) * 100).toFixed(1)
              : "0.0",
          }))
          .sort((a, b) => b.userCount - a.userCount),
      },
    });
  } catch (error) {
    console.error("Get map stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get map statistics",
      error: error.message,
    });
  }
};
