import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home             from "./pages/Home";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import Dashboard        from "./pages/Dashboard";

// Criteria 1
import Criterion1_1   from "./pages/criteria1/Criterion1_1";
import Criterion1_1_3 from "./pages/criteria1/Criterion1_1_3";
import Criterion1_2_1 from "./pages/criteria1/Criterion1_2_1";
import Criterion1_2_2 from "./pages/criteria1/Criterion1_2_2";
import Criterion1_3_2 from "./pages/criteria1/Criterion1_3_2";
import Criterion1_3_3 from "./pages/criteria1/Criterion1_3_3";

// Criteria 2
import Criterion2_1   from "./pages/criteria2/Criterion2_1";
import Criterion2_1_1 from "./pages/criteria2/Criterion2_1_1";
import Criterion2_2   from "./pages/criteria2/Criterion2_2";
import Criterion2_1_2 from "./pages/criteria2/Criterion2_1_2";
import Criterion2_3   from "./pages/criteria2/Criterion2_3";
import Criterion2_3_3 from "./pages/criteria2/Criterion2_3_3";
import Criterion2_4_1 from "./pages/criteria2/Criterion2_4_1";
import Criterion2_4_2 from "./pages/criteria2/Criterion2_4_2";
import Criterion2_6_3 from "./pages/criteria2/Criterion2_6_3";

// Criteria 4
import Criterion4_1_3 from "./pages/criteria4/Criterion4_1_3";
import Criterion4_1_4 from "./pages/criteria4/Criterion4_1_4";
import Criterion4_2_2 from "./pages/criteria4/Criterion4_2_2";

// Criteria 5
import Criterion5_1_1 from "./pages/criteria5/Criterion5_1_1";
import Criterion5_1_3 from "./pages/criteria5/Criterion5_1_3";
import Criterion5_1_4 from "./pages/criteria5/Criterion5_1_4";
import Criterion5_2_1 from "./pages/criteria5/Criterion5_2_1";
import Criterion5_2_2 from "./pages/criteria5/Criterion5_2_2";
import Criterion5_2_3 from "./pages/criteria5/Criterion5_2_3";
import Criterion5_3_1 from "./pages/criteria5/Criterion5_3_1";
import Criterion5_3_3 from "./pages/criteria5/Criterion5_3_3";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/dashboard"   element={<Dashboard />} />

        {/* Criteria 1 */}
        <Route path="/criteria1/1-1"   element={<Criterion1_1 />} />
        <Route path="/criteria1/1-1-3" element={<Criterion1_1_3 />} />
        <Route path="/criteria1/1-2-1" element={<Criterion1_2_1 />} />
        <Route path="/criteria1/1-2-2" element={<Criterion1_2_2 />} />
        <Route path="/criteria1/1-3-2" element={<Criterion1_3_2 />} />
        <Route path="/criteria1/1-3-3" element={<Criterion1_3_3 />} />

        {/* Criteria 2 */}
        <Route path="/criteria2/2-1"   element={<Criterion2_1 />} />
        <Route path="/criteria2/2-1-1" element={<Criterion2_1_1 />} />
        <Route path="/criteria2/2-2"   element={<Criterion2_2 />} />
        <Route path="/criteria2/2-1-2" element={<Criterion2_1_2 />} />
        <Route path="/criteria2/2-3"   element={<Criterion2_3 />} />
        <Route path="/criteria2/2-3-3" element={<Criterion2_3_3 />} />
        <Route path="/criteria2/2-4-1" element={<Criterion2_4_1 />} />
        <Route path="/criteria2/2-4-2" element={<Criterion2_4_2 />} />
        <Route path="/criteria2/2-6-3" element={<Criterion2_6_3 />} />

        {/* Criteria 4 */}
        <Route path="/criteria4/4-1-3" element={<Criterion4_1_3 />} />
        <Route path="/criteria4/4-1-4" element={<Criterion4_1_4 />} />
        <Route path="/criteria4/4-2-2" element={<Criterion4_2_2 />} />

        {/* Criteria 5 */}
        <Route path="/criteria5/5-1-1" element={<Criterion5_1_1 />} />
        <Route path="/criteria5/5-1-3" element={<Criterion5_1_3 />} />
        <Route path="/criteria5/5-1-4" element={<Criterion5_1_4 />} />
        <Route path="/criteria5/5-2-1" element={<Criterion5_2_1 />} />
        <Route path="/criteria5/5-2-2" element={<Criterion5_2_2 />} />
        <Route path="/criteria5/5-2-3" element={<Criterion5_2_3 />} />
        <Route path="/criteria5/5-3-1" element={<Criterion5_3_1 />} />
        <Route path="/criteria5/5-3-3" element={<Criterion5_3_3 />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
