import  {StyledText}   from './component/StyledText.js';
import  {LoginScreen}   from './component/LoginScreen.js';
import  {OtpScreen}   from './component/OtpScreen.js';
import  {RegisterScreen}   from './component/RegisterScreen.js';
import  ContactCreation    from './component/ContactCreation.js';
import  ViewNewContract    from './component/ViewNewContract.js';
import  { HttpsClient }   from './component/HttpsClient.js';

import SettingScreen from './component/SettingScreen.js';
import CompanyDetails from './component/CompanyDetails.js';
import ProductSheet from './component/ProductSheet.js';
import AddMasterProduct from './component/AddMasterProduct.js';
import NationalHolidays from './component/NationalHolidays.js';
import CreateHoliday from './component/CreateHoliday.js';
import PolicyDocuments from './component/PolicyDocuments.js';
import ManageUsers from './component/ManageUsers.js';
import EmployeeList from './component/EmployeeList.js';
import TeamPage from './component/TeamPage.js';
import CreateTeam from './component/CreateTeam.js';
import OldEmployees from './component/OldEmployees.js';
import NoticePeriod from './component/NoticePeriod.js';
import EmployeeProfile from './component/EmployeeProfile.js';
import NewEmployee from './component/NewEmployee.js';


import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer} from 'react-navigation';


const LoginStack =  createStackNavigator({
      LoginScreen: {
        screen: LoginScreen,
        navigationOptions: {
        header: null
        },
      },
      OtpScreen: {
        screen: OtpScreen,
        navigationOptions: {
        header: null
      }
    }
  })

const SettingStack =  createStackNavigator({
    SettingScreen:{
      screen: SettingScreen,
    },
    CompanyDetails:{
      screen: CompanyDetails,
    },
    ProductSheet:{
      screen: ProductSheet,
    },
    AddMasterProduct:{
      screen: AddMasterProduct,
    },
    NationalHolidays:{
      screen: NationalHolidays,
    },
    CreateHoliday:{
      screen: CreateHoliday,
    },
    PolicyDocuments:{
      screen: PolicyDocuments,
    },
 },
 {
   initialRouteName: 'SettingScreen',
 })

const ManageUsersStack =  createStackNavigator({
  ManageUsers:{
    screen: ManageUsers,
  },
  EmployeeList:{
    screen: EmployeeList,
  },
  NewEmployee:{
    screen: NewEmployee,
  },
  TeamPage:{
    screen: TeamPage,
  },
  CreateTeam:{
    screen: CreateTeam,
  },
  OldEmployees:{
    screen: OldEmployees,
  },
  NoticePeriod:{
    screen: NoticePeriod,
  },
  EmployeeProfile:{
    screen: EmployeeProfile,
  },
},
{
 initialRouteName: 'ManageUsers',
})

  export {
    ManageUsersStack,
    SettingStack,
    LoginStack,
    RegisterScreen,
    ContactCreation,
    ViewNewContract,
    HttpsClient
  }
