import {configureStore} from "@reduxjs/toolkit";

import UserSlice from "./UserSlicer.js";

const store=configureStore(
    {
        reducer:{UserSlice}
    }
)

export default store;