import {useEffect, useReducer, useRef} from "react";
import './Form_Validation.style.css'


function Strength(password) {
    let i = 0;
    if (password.length > 6) {
      i++;
    }
    if (password.length >= 10) {
      i++;
    }
    if (/[A-Z]/.test(password)) {
      i++;
    }
  
    if (/[0-9]/.test(password)) {
      i++;
    }
    if (/[A-Za-z0-9]/.test(password)) {
      i++;
    }
    if (/^[A-Za-z0-9]/.test(password)) {
      i++;
    }
    
    return i;
}


function EmptyAll(){
    let email = document.getElementById("email");
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let birthdate = document.getElementById("birthdate");


    password.style.cssText = "border: 2px solid 1px solid #ff3333;"
    document.getElementById("strength-description").style.cssText = "width:0;padding:0;";

    let arr = [email,username,password,birthdate];
    arr.map((input)=>{
        input.value = "";
    })
    birthdate.value = (new Date()).toISOString().substring(0,10)
}



const default_values = {
    errors: [],
    showSuccess: false,
    passwordStrength:  "Weak",
    usernameBlacklist: []
}


function formReducerFunc(state,action){
    switch(action.type){
        case "Error":
            return{
                ...state,
                errors: [...state.errors, action.error]
            }
        case 'Clear_Errors':
            return {
                ...state,
                errors: []
            }
        case "ShowSuccess":
            return{
                ...state,
                showSuccess: action.showSuccess
            }
        case "Strength":
            return{
                ...state,
                passwordStrength: action.passwordStrength
            }
        case "BlackList":
            return{
                ...state,
                usernameBlacklist: action.usernameBlacklist
            }
        default:
            return state
    }
}




export default function Form(){

    const [formReducer, dispatch] = useReducer(formReducerFunc,default_values);


    const email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g

    const emailRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const birthdateRef = useRef();




    async function GetBlackListUsername(){
        let data = await fetch("https://raw.githubusercontent.com/marteinn/The-Big-Username-Blocklist/main/list.json");
        let new_data = await data.json();
        dispatch({
            type: "BlackList",
            usernameBlacklist: new_data,
        })
        
    }

    useEffect(()=>{
        emailRef.current.focus()
        birthdateRef.current.value = (new Date()).toISOString().substring(0,10);
        
        GetBlackListUsername()
        document.getElementById("password").style.cssText = `border-radius: 0.375rem;`
    },[])



    function handleUsername(){
        let username = document.getElementById("username").value;
        let is_valid = username.length >= 4;
        
        formReducer.usernameBlacklist.map((val)=> {
            if (val === username){
                is_valid = false;
            }
        })
        return is_valid;
    }
    
    function hanldePassword(e){
        let element = e.currentTarget
        let valid_result = Strength(element.value);
    


        element.style.cssText = "box-shadow: none"
        let strength_description = document.getElementById("strength-description");
        
        if (valid_result === 0){
            strength_description.style.cssText = `
            padding: 0;
            width: 0;`
            document.getElementById("password").style.cssText = `border-radius: 0.375rem;`
        }
        if (valid_result >=1 && valid_result <=3){
            element.style.cssText = "border: 2px solid #ff3333;box-shadow: none";
            strength_description.style.cssText = `
            background-color: #ff3333;
            border: 1px solid #ff3333;
            padding: 0.375rem 0.75rem;
            width: auto;`
            
            dispatch({
                type: "Strength",
                passwordStrength: "Weak",
            })
        }
        if (valid_result >=4 && valid_result <=5){
            element.style.cssText = "border: 2px solid #FFA500;box-shadow: none";
            strength_description.style.cssText = `
            background-color: #FFA500;
            border: 1px solid #FFA500;
            padding: 0.375rem 0.75rem;
            width: auto;`

            dispatch({
                type: "Strength",
                passwordStrength: "Medium",
            })
        }
        if (valid_result === 6){
            element.style.cssText = "border: 2px solid #00A86B;box-shadow: none";
            strength_description.style.cssText = `
            background-color: #00A86B;
            border: 1px solid #00A86B;
            padding: 0.375rem 0.75rem;
            width: auto;`

            dispatch({
                type: "Strength",
                passwordStrength: "Strong",
            })
        }
    }
    
    function handleSubmit(e){
        e.preventDefault();
        handleUsername();

        let isEmailValid = emailRef.current.value.match(email_regex);
        let isUsernameValid = handleUsername();
        let isPasswordValid = formReducer.passwordStrength !== "Weak";

        let min_birth_year = new Date().getFullYear() - 13;
        let isBirthdataValid = birthdateRef.current.value.split("-")[0] <= min_birth_year;


        dispatch({ type: 'Clear_Errors' });

        dispatch({
            type: "ShowSuccess",
            showSuccess: false,
        })
        if (!isEmailValid) {
            dispatch({
                type: "Error",
                error: 'Email is not valid',
            })
        }
        if (!isUsernameValid){
            dispatch({
                type: "Error",
                error: 'Invalid username',
            })
        }
        if (!isPasswordValid){
            dispatch({
                type: "Error",
                error: 'Passowrd too weak',
            })
        }
        if (!isBirthdataValid){
            dispatch({
                type: "Error",
                error: 'age > 12',
            })
        }




        if (isEmailValid && isUsernameValid && isPasswordValid && isBirthdataValid){
            dispatch({
                type: "ShowSuccess",
                showSuccess: true,
            })
            EmptyAll()
        }


    }

    return (

        <div className="container mt-5 pt-5 w-75">
            <form>
                <h1 className="text-center fw-bold mb-5">Sign Up</h1>
                {
                
                (formReducer.errors.length > 0 )?<div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Errors</h4>
                    <ul>
                        {formReducer.errors.map((error,index)=><li key={index}>{error}</li>)}
                    </ul>
                </div>: ''
                }

                {
                    (formReducer.showSuccess) ? <div className="alert alert-success" role="alert">
                    <strong className="alert-heading" style={{fontSize: "1.7rem"}}>Success</strong>
                    
                </div>: ''
                }
                
                <div className="mt-2">
                    <label htmlFor="email" className="form-label fw-bold">Email</label>
                    <input type="text" id="email" ref={emailRef} className="form-control"/>
                </div>
                <div className="mt-2">
                    <label htmlFor="username" className="form-label fw-bold">Username</label>
                    <input type="text" id="username" ref={usernameRef} className="form-control"/>
                </div>
                <div className="mt-2">
                    <label htmlFor="password" className="form-label fw-bold">Password</label>
                    <div className="input-group">
                        <input style={{boxShadow: "none"}} type="password" id="password" onChange={hanldePassword} ref={passwordRef} className="form-control" aria-describedby="passwordHelpBlock"/>
                        <div id="strength-description" className="input-group-text">{formReducer.passwordStrength}</div>
                        
                    </div>
                    <small id="password" className="text-muted">
                            Must be 8-20 characters long.
                    </small>
                </div>
                <div className="mt-2">
                    <label htmlFor="birthdate" className="form-label fw-bold">Birthdate</label>
                    <input type="date" id="birthdate" ref={birthdateRef} className="form-control date"/>
                </div>
                <div className="text-center">
                    <button className="btn btn-primary fw-bold mt-4 w-50" onClick={handleSubmit}>Save</button>
                </div>
            </form>
        </div>

    )
}