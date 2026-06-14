import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import bcrypt from "bcryptjs";
import Friendship from "../models/friendship.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "tranthib@gmail.com",
    fullName: "Tran Thi B",
    password: "2",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "phamthid@gmail.com",
    fullName: "Pham Thi D",
    password: "4",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "vuthif@gmail.com",
    fullName: "Vu Thi F",
    password: "6",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    email: "buithih@gmail.com",
    fullName: "Bui Thi H",
    password: "2",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    email: "lyththij@gmail.com",
    fullName: "Ly Thi J",
    password: "4",
    profilePic: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    email: "duongthil@gmail.com",
    fullName: "Duong Thi L",
    password: "6",
    profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    email: "leththin@gmail.com",
    fullName: "Le Thi N",
    password: "2",
    profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    email: "nguyenthip@gmail.com",
    fullName: "Nguyen Thi P",
    password: "4",
    profilePic: "https://randomuser.me/api/portraits/women/16.jpg",
  },
  {
    email: "hoththir@gmail.com",
    fullName: "Ho Thi R",
    password: "6",
    profilePic: "https://randomuser.me/api/portraits/women/18.jpg",
  },
  {
    email: "dinhthit@gmail.com",
    fullName: "Dinh Thi T",
    password: "2",
    profilePic: "https://randomuser.me/api/portraits/women/20.jpg",
  },

  // Male Users
  {
    email: "nguyenvana@gmail.com",
    fullName: "Nguyen Van A",
    password: "1",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "lequangc@gmail.com",
    fullName: "Le Quang C",
    password: "3",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "hoangvane@gmail.com",
    fullName: "Hoang Van E",
    password: "5",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "dangvang@gmail.com",
    fullName: "Dang Van G",
    password: "1",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    email: "dovani@gmail.com",
    fullName: "Do Van I",
    password: "3",
    profilePic: "https://randomuser.me/api/portraits/men/9.jpg",
  },
  {
    email: "ngovanK@gmail.com",
    fullName: "Ngo Van K",
    password: "5",
    profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    email: "tranvanm@gmail.com",
    fullName: "Tran Van M",
    password: "1",
    profilePic: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    email: "phanvano@gmail.com",
    fullName: "Phan Van O",
    password: "3",
    profilePic: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    email: "vovanq@gmail.com",
    fullName: "Vo Van Q",
    password: "5",
    profilePic: "https://randomuser.me/api/portraits/men/17.jpg",
  },
  {
    email: "lamvans@gmail.com",
    fullName: "Lam Van S",
    password: "1",
    profilePic: "https://randomuser.me/api/portraits/men/19.jpg",
  },
];

const buildSeedProfile = (user, index) => ({
  ...user,
  username: user.email.split("@")[0].toLowerCase(),
  isSeedUser: true,
  coverPhoto: `https://picsum.photos/seed/pingme-cover-${index}/1400/480`,
  bio: "Yêu kết nối, chia sẻ những khoảnh khắc tích cực trên PingMe.",
  currentCity: index % 2 ? "Đà Nẵng" : "Hội An",
  hometown: "Quảng Nam",
  hobbies: ["Âm nhạc", "Du lịch", "Công nghệ"],
  interests: ["Bạn bè", "Nhiếp ảnh"],
  skills: ["Giao tiếp", "Làm việc nhóm"],
});

const seedDatabase = async () => {
  try {
    await connectDB();
    const seededUsers = [];
    for (const [index, rawUser] of seedUsers.entries()) {
      const profile = buildSeedProfile(rawUser, index);
      const password = await bcrypt.hash(String(rawUser.password), 10);
      const user = await User.findOneAndUpdate(
        { email: rawUser.email.toLowerCase() },
        { $set: { ...profile, password } },
        { upsert: true, new: true, runValidators: true }
      );
      seededUsers.push(user);
    }
    console.log(`Seeded ${seededUsers.length} PingMe users`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
