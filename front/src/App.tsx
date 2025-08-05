import HomePage from "./page/home.page.tsx";
import {Route, Routes} from "react-router-dom";


import {Toaster} from "react-hot-toast";
import {RegisterPage} from "./page/register.page.tsx";
import {LoginPage} from "./page/login.page.tsx";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
            </Routes>
            <Toaster position="top-right"/>
        </>
    );
}

export default App;
