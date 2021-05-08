import React from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,StatusBar,Vibration,TouchableWithoutFeedback,TextInput,Linking
} from 'react-native';
import { FontAwesome,FontAwesome5,MaterialCommunityIcons,Feather,MaterialIcons,Octicons,AntDesign,Ionicons,SimpleLineIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { StackActions, NavigationActions } from 'react-navigation';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Card } from 'react-native-elements';
import  ModalBox from 'react-native-modalbox';
import NetInfo from '@react-native-community/netinfo';
import { Notifications } from 'expo';
import * as  ImagePicker  from 'expo-image-picker';
import Modal from "react-native-modal";
import settings from './Constants.js';
import {SearchBar}from 'react-native-elements';
import {
  SharedElement,
  SharedElementTransition,
  nodeFromRef
} from 'react-native-shared-element';
import moment from 'moment';
import * as Updates from 'expo-updates';
import AppLink from 'react-native-app-link';
import {ContactCreation} from 'react-setup-initial';
import  { HttpsClient }  from './HttpsClient.js';
import DropDownPicker from 'react-native-dropdown-picker';
import DatePicker from 'react-native-datepicker';

const themeColor = settings.themeColor
const url = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

const { width,height } = Dimensions.get('window');

import Toast, {DURATION} from 'react-native-easy-toast'


const colorsList = ['red','blue','black','green']

export default class CreateHoliday extends React.Component{

    static navigationOptions=({navigation})=>{
      const { params = {} } = navigation.state
      return {header:null}
    };

    constructor(props) {
      super(props);

      this.state = {
         SERVER_URL:'',
         data:null,
         name:'',
         date:moment(new Date()).format('YYYY-MM-DD')
      };
      willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
         this.refresh()
         }
    );
  }

    refresh=()=>{
    }

    componentDidMount=()=>{
      this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
    }

   handleConnectivityChange=(state)=>{
    if(state.isConnected){
    }else{
      this.setState({connectionStatus : false})
      ToastAndroid.showWithGravityAndOffset('No Internet Connection',  ToastAndroid.LONG, ToastAndroid.CENTER,25,50);
    }
  }


    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',paddingHorizontal:15,}}>
          <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{flex:0.15,alignItems:'center',justifyContent:'center'}}>
            <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
          </TouchableOpacity>
          <View style={{flex:0.7,justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:'#252525',fontSize:20,fontWeight:'700'}}>Create Holiday</Text>
          </View>
          <View style={{flex:0.15,}}>
          </View>
       </View>
      )
    }

    save=async()=>{
    if(this.state.name.length==0){
      this.toast.show('Enter Holiday Name',2000);
      return
    }

    var sendData = {
      name:this.state.name,
      date:this.state.date,
      typ: 'restricted'
    }
    var serverurl = url+'/api/organization/companyHoliday/'
    var data = await HttpsClient.post(serverurl,sendData)

    if(data.type=='success'){
      this.props.navigation.goBack()
    }else{
      return
    }
  }

    render(){
        return(
          <View style={{flex:1,backgroundColor:"#fff"}}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#fff'}}>
               <StatusBar   translucent={true} barStyle="light-content" backgroundColor={'#fff'} networkActivityIndicatorVisible={false}    />
            </View>
            {this.renderHeader()}
            <View style={{flex:1}}>

            <View style={{marginHorizontal:25,marginVertical:10,marginTop:25}}>
              <Text style={{color:'#000',fontSize:18,paddingBottom:10,fontWeight:'700'}}>Name</Text>
              <View style={{flexDirection:'row',}}>
                <View style={{flex:1,alignItems:'center',justifyContent:'center',}}>
                   <TextInput style={{height: 45,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                     placeholder="Enter holiday Name"
                     selectionColor={'#000'}
                     placeholderTextColor='rgba(0, 0, 0, 0.5)'
                     onChangeText={query => { this.setState({ name: query }); }}
                     value={this.state.name}
                    />
                </View>
              </View>
            </View>

            <View style={{paddingVertical:15,paddingHorizontal:25,}}>
              <Text style={{color:"#000",fontWeight:'700',fontSize:18,paddingBottom:10}}>Date</Text>
              <DatePicker
                          style={{width:'100%',paddingRight:4}}
                          date={this.state.date}
                          mode="date"
                          placeholder='YYYY-MM-DD'
                          confirmBtnText="Confirm"
                          cancelBtnText="Cancel"
                          showIcon={true}
                          iconComponent={
                            <FontAwesome
                                size={width*0.04}
                                color='#1a689a'
                                name='calendar'
                            />
                          }
                          customStyles={{
                              dateIcon: {
                                       position: 'relative',
                                       left:0,
                                       top: 4,
                                       right:60,
                                       marginRight:60,
                                     },
                              dateInput: {
                                       paddingHorizontal:10,
                                       height:45,
                                       borderWidth:0.2,
                                       borderRadius:10,
                                       borderColor:'#F3F6FB',
                                       fontSize:width*0.04,
                                       backgroundColor:'#F3F6FB',
                                       alignItems:'flex-start',
                                       marginRight:-20,
                                 }
                          }}
                          onDateChange={(date) => {this.setState({date})}}/>
            </View>

            <View style={{flex:1,justifyContent: 'flex-end', alignItems: 'center',paddingBottom:80}}>
              <TouchableOpacity onPress={()=>{this.save();}} style={{justifyContent: 'center', alignItems: 'center',backgroundColor:'#031A6E',paddingHorizontal:30,borderRadius:10,paddingVertical:12}}>
                <Text style={{color:'#fff',fontWeight:'700',fontSize:18}}>Create</Text>
              </TouchableOpacity>
           </View>


            </View>
            <Toast ref={(toast) => this.toast = toast} style={[styles.shadow,{backgroundColor:'#fff'}]}
              position='bottom'
              positionValue={100}
              fadeInDuration={750}
              fadeOutDuration={1000}
              opacity={1}
              textStyle={{color:'#000'}}/>
          </View>
      );
    }
  }

  const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     shadow: {
         shadowColor: "#000",
         shadowOffset: {
           width: 0,
           height: 2,
         },
         shadowOpacity: 0.25,
         shadowRadius: 3.84,
         elevation: 3,
         borderColor:'#fff'
       },
     center:{
       alignItems:'center',
       justifyContent:'center'
     },
     iconStyle:{
       width:width*0.2,
       height:width*0.15,
       resizeMode:'contain'
     },
     iconContainer:{
       width: width*0.3,height:width*0.3,margin:0,padding:15,marginHorizontal:0,borderRadius:10,
     },
     iconText:{
       fontWeight:'700',color:'#444',fontSize:18,marginVertical:5
     },
     modalViewUpdate: {
       backgroundColor: '#fff',
       marginHorizontal: width*0.01 ,
       borderRadius:5,
    },

   });
