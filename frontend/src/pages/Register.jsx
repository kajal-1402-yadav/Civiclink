import Form from "../components/Form"

function Register() {
    try{
        return <Form route="/api/user/register/" method="register" />

    }
    catch (err) {
        if (err.response && err.response.data) {
            console.error("Backend error:", err.response.data);
            alert(JSON.stringify(err.response.data, null, 2)); 
        } else {
            alert("Authentication failed! " + (err.message || ""));
        }
    }
}

export default Register