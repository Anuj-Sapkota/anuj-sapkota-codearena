//This function generates a auto username
export const generateUsername = (fullName: string):string => {
    const parts = fullName.trim().toLowerCase().split(/\s+/);
    // splitting into parts
    const firstName = parts[0] || "user";
    const lastName = parts[1] || "anon";

    // last random number
    const randomNum = Math.floor(10000+ Math.random() * 90000) // this number should be scaled if users increase or another method should be applied

    return `${firstName}.${lastName}.${randomNum};`
}