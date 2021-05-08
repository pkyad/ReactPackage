import React from 'react';
import {
  Image,Platform,
  ScrollView,StyleSheet,
  Text,Button,TextInput,
  TouchableOpacity,View,
  Slider,ImageBackground,
  Dimensions, Alert,StatusBar,
  FlatList, AppState, BackHandler ,
  AsyncStorage,ActivityIndicator,
  ToastAndroid,RefreshControl,TouchableWithoutFeedback} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import {SearchBar}from 'react-native-elements';
import { FontAwesome,Entypo ,MaterialIcons,Ionicons,AntDesign,Feather} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import settings from './Constants.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Switch } from 'react-native-switch';
import Modal from "react-native-modal";
import { Searchbar } from 'react-native-paper';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Card } from 'react-native-elements';

const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

class ManageUsers extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state
      return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={
      bool:false
    }
     willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          this.changeVal()
        }
     );
    }
    changeVal=()=>{
      this.setState({bool:!this.state.bool})
      // StatusBar.setBackgroundColor('#f3f3f3')
    }


  setServerurl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
  }

  componentDidMount(){
    this.setServerurl()
  }


  render() {
    return (
      <View style={{flex:1,backgroundColor:'#f3f3f3'}}>

            <Toast style={{backgroundColor:'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#f3f3f3'}}>
              <StatusBar   translucent={true} barStyle="dark-content" backgroundColor={'#f3f3f3'} networkActivityIndicatorVisible={false}    />
            </View>

            <View style={{flex:1}}>

              <View style={{height:55,backgroundColor:'#f3f3f3',}}>
                <View style={{flexDirection: 'row',height:55,alignItems: 'center',backgroundColor:'#f3f3f3'}}>
                   <TouchableOpacity onPress={()=>this.props.navigation.navigate('Main')} style={{ position:'absolute',left:0,top:0,bottom:0, justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
                     <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
                   </TouchableOpacity>
                </View>
              </View>

              <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                <Text style={{color:'#252525',fontSize:30,fontWeight:'600'}}>Manage Employee</Text>

                <TouchableOpacity onPress={()=>{this.props.navigation.navigate('EmployeeList')}} style={{marginVertical:25,backgroundColor:'#fff',flexDirection:'row',borderRadius:25,borderColor:'grey',paddingVertical:15}}>
                  <View style={{flex:0.2,alignItems:'center'}}>
                    <Image style={{width:20,height:20,}} source={require('./Images/icons8-permanent-job-96.png')} />
                  </View>
                  <View style={{flex:0.8,}}>
                    <Text style={{color:'#252525',fontSize:18,fontWeight:'600'}}>All</Text>
                    {
                      // <Text style={{color:'#b2b2b2',fontSize:14,fontWeight:'600'}}>Configure your Employee Details here...</Text>
                    }
                  </View>
                </TouchableOpacity>

                <View style={{backgroundColor:'#fff',borderRadius:25,borderColor:'grey',}}>

                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('NoticePeriod')}} style={{width:'100%',paddingVertical:15,flexDirection:'row',borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                    <View style={{flex:0.2,alignItems:'center'}}>
                      <Image style={{width:20,height:20,}} source={require('./Images/icons8-disclaimer-100.png')} />
                    </View>
                    <View style={{flex:0.8,}}>
                      <Text style={{color:'#252525',fontSize:18,fontWeight:'600'}}>On Notice Period</Text>
                      {
                        // <Text style={{color:'#b2b2b2',fontSize:14,fontWeight:'600'}}>Configure your Ratelist...</Text>
                      }
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('OldEmployees')}} style={{width:'100%',paddingVertical:15,flexDirection:'row',borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                    <View style={{flex:0.2,alignItems:'center'}}>
                      <Image style={{width:20,height:20,}} source={require('./Images/icons8-old-man-100.png')} />
                    </View>
                    <View style={{flex:0.8,}}>
                      <Text style={{color:'#252525',fontSize:18,fontWeight:'600'}}>Old Employees</Text>
                      {
                        // <Text style={{color:'#b2b2b2',fontSize:14,fontWeight:'600'}}>Configure your Company's Holiday here...</Text>
                      }
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('TeamPage')}} style={{width:'100%',paddingVertical:15,flexDirection:'row'}}>
                    <View style={{flex:0.2,alignItems:'center'}}>
                      <Image style={{width:20,height:20,}} source={require('./Images/icons8-member-100.png')} />
                    </View>
                    <View style={{flex:0.8,}}>
                      <Text style={{color:'#252525',fontSize:18,fontWeight:'600'}}>Teams</Text>
                      {
                        // <Text style={{color:'#b2b2b2',fontSize:14,fontWeight:'600'}}>Your employees can see these documents any time...</Text>
                      }
                    </View>
                  </TouchableOpacity>

                </View>

              </View>

              <View style={{flexDirection:'row',marginBottom:30}}>
                <View style={{flex:0.3,alignItems:'center',justifyContent:'center'}}>
                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('EmployeeList')}} style={{flexDirection:'row',backgroundColor:'#CACBC5',height:45,alignItems:'center',paddingHorizontal:15,borderRadius:10}}>
                    <FontAwesome name="cloud-download"  size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <View style={{flex:0.7,alignItems:'center',justifyContent:'center',}}>
                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('NewEmployee')}} style={{flexDirection:'row',backgroundColor:'#CACBC5',height:45,alignItems:'center',paddingHorizontal:15,borderRadius:10}}>
                    <Feather name="user-plus" size={24} color="#393939" />
                    <Text style={{color:'#393939',fontSize:18,fontWeight:'600',paddingHorizontal:4,paddingLeft:10}}>Add New Employee</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>



      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 3.84,
    elevation: 3,
  },
});


export default ManageUsers;
