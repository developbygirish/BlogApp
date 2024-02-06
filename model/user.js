const mongoose = require('mongoose')
const { createHmac, randomBytes } = require('crypto')


const auth = require("../service/auth")

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDb is connected...."))
    .catch(err => console.log("The Database Error is : " + err))


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
    }
    ,
    password: {
        type: String,
        required: true
    }
    ,
    profileImage: {
        type: String,
        default: "./images/user-profile.png"
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: 'USER'
    }
}, { timestamps: true })


// Encrypt Password
userSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

// Login with Encrypted Password

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) throw new Error("User not Found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userprovidedHash = createHmac("sha256", salt)
        .update(password)  // Fix: Use the provided password here
        .digest('hex');

    if (!(hashedPassword === userprovidedHash)) throw new Error("Incorrect Password");

    const token = auth.setUser(user);
    return token;
});




const User = mongoose.model('User', userSchema);

module.exports = User;