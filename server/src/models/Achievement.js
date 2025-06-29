import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Achievement = sequelize.define('Achievement', {
  AchievementID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Icon: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  BadgeColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'blue'
  },
  Category: {
    type: DataTypes.ENUM('time_based', 'milestone', 'behavior', 'health', 'social'),
    allowNull: false,
    defaultValue: 'milestone'
  },
  Criteria: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON object containing achievement criteria'
  },
  Points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  Rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    allowNull: false,
    defaultValue: 'common'
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Achievement',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

// User Achievement junction table
const UserAchievement = sequelize.define('UserAchievement', {
  UserAchievementID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'UserID'
    }
  },
  AchievementID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Achievement',
      key: 'AchievementID'
    }
  },
  UnlockedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  IsShared: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'UserAchievement',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['UserID', 'AchievementID']
    }
  ]
});

// Instance methods for Achievement
Achievement.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Parse criteria nếu là string
  if (typeof values.Criteria === 'string') {
    try {
      values.Criteria = JSON.parse(values.Criteria);
    } catch (e) {
      values.Criteria = {};
    }
  }
  
  return values;
};

// Static methods for Achievement
Achievement.getActiveAchievements = async function() {
  return await this.findAll({
    where: { IsActive: true },
    order: [['Category', 'ASC'], ['Points', 'ASC']]
  });
};

Achievement.getByCategory = async function(category) {
  return await this.findAll({
    where: { 
      Category: category,
      IsActive: true 
    },
    order: [['Points', 'ASC']]
  });
};

// Static methods for UserAchievement
UserAchievement.getUserAchievements = async function(userId) {
  return await this.findAll({
    where: { UserID: userId },
    include: [{
      model: Achievement,
      required: true
    }],
    order: [['UnlockedAt', 'DESC']]
  });
};

UserAchievement.checkUserHasAchievement = async function(userId, achievementId) {
  const record = await this.findOne({
    where: {
      UserID: userId,
      AchievementID: achievementId
    }
  });
  return !!record;
};

UserAchievement.unlockAchievement = async function(userId, achievementId) {
  const [userAchievement, created] = await this.findOrCreate({
    where: {
      UserID: userId,
      AchievementID: achievementId
    },
    defaults: {
      Progress: 100,
      UnlockedAt: new Date()
    }
  });
  
  return { userAchievement, isNew: created };
};

// Define associations
Achievement.hasMany(UserAchievement, { foreignKey: 'AchievementID' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'AchievementID' });

export { Achievement, UserAchievement };
export default Achievement;
