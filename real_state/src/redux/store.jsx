import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slicer/userSlicer'

export const store=configureStore({
    reducer:{
        user:userReducer
    }
})