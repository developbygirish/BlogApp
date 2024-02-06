const jwt=require('jsonwebtoken')
const secret= 'Girish$897@'


exports.setUser=(user)=>{
    return jwt.sign({
        _id:user._id,
        username:user.name,
        email:user.email,
        image:user.profileImage,
        role:user.role
    }, secret)
}


exports.getUser = (token) => {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
