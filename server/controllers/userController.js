import sql from "../configs/db";


export const getUserCreations = async (req,res)=>{
    try {
        const {userId} = req.auth();

        const creations = await sql`SELECT * FROM creation WHERE user_id=${userId} ORDER BY created_at DESC`;

        res.json({success:true,creations});

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

export const getPublishedCreations = async (req,res)=>{
    try {

        const creations = await sql`SELECT * FROM creation WHERE publish = true ORDER BY created_at DESC`;

        res.json({success:true,creations});

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

export const toggleLikeCreations = async (req,res)=>{
    try {

        const {userId} = req.auth();
        const {Id} = req.body;

        const[creation] = await sql`SELECT * FROM creation WHERE id=${Id}`;
        if(!creation) {
            return res.json({success:false,message:"Creation not found"});
        }
        const currentLikes = creation.likes;
        const userIdStr = userId.toString();

        let updatedLikes;
        let message;
        if(currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = "Like removed";
        }else{
            updatedLikes = [...currentLikes,userIdStr];
            message = "Like added";
        }

        const formattedArray = `{${updatedLikes.join(',')}}`;

        await sql`UPDATE creation SET likes=${formattedArray}::text[] WHERE id=${Id}`;

        res.json({success:true,message});

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}