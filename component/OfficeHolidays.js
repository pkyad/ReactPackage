import React from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,StatusBar,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler ,ImageBackground, AsyncStorage,Keyboard,TextInput,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation,
} from 'react-native';
import { FontAwesome,MaterialIcons ,AntDesign} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card ,SearchBar , Icon,Badge,CheckBox} from 'react-native-elements';
import { StackActions, NavigationActions } from 'react-navigation';
import { FloatingAction } from "react-native-floating-action";
import Modal from "react-native-modal";
import NetInfo from '@react-native-community/netinfo';
import  ModalBox from 'react-native-modalbox';
import DatePicker from 'react-native-datepicker';
import {
  SharedElement,
  SharedElementTransition,
  nodeFromRef
} from 'react-native-shared-element';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars'
import moment from 'moment';

const { width,height } = Dimensions.get('window');



const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

export default class OfficeHolidays extends React.Component{

    static navigationOptions=({navigation})=>{
      const { params = {} } = navigation.state
      return {header:null}
    };


    constructor(props) {
      super(props);
      this.state = {
        keyboardOffset:0,
        keyboardOpen:false,
        SERVER_URL:'',
        sessionid:'',
        userPk:'',
        csrf:'',
        leaveObj:null,
        showEdit:false,
        leaveList:[],
        openModal:false,
        selected:null,
        holidays:[]
      };
      Keyboard.addListener('keyboardDidHide',this.keyboardDidHide)
      Keyboard.addListener( 'keyboardDidShow', this.keyboardDidShow)

    }


    handleConnectivityChange=(state)=>{
     if(state.isConnected){
       this.setState({connectionStatus:true})
       tthis.GetPayroll()
     }else{
       this.setState({connectionStatus : false})
       ToastAndroid.showWithGravityAndOffset(
       'No Internet Connection',
       ToastAndroid.LONG, //can be SHORT, LONG
       ToastAndroid.CENTER, //can be TOP, BOTTON, CENTER
       25,
       50
     );
     }
 }


    componentDidMount=()=>{

       this.setState({unsubscribe:NetInfo.addEventListener(state =>{
        this.handleConnectivityChange(state);
      })})
    }

    keyboardDidShow=(event)=> {
        this.setState({
            keyboardOffset: event.endCoordinates.height+27,
            keyboardOpen:true,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOffset: 27,
            keyboardOpen:false,
        })
  }


   componentDidMount=()=>{
     this.getLeaves()
   }

   getLeaves=async()=>{
     const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');
     const userToken = await AsyncStorage.getItem('userpk');
     this.setState({SERVER_URL:SERVER_URL,sessionid:sessionid,csrf:csrf});
     console.log(SERVER_URL+'/api/organization/companyHoliday/','jjj');
     fetch(SERVER_URL+'/api/organization/companyHoliday/', {
       headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Content-Type': 'application/json',
         'X-CSRFToken':csrf,
         'Referer': SERVER_URL,
       },
     }).then((response) =>{
         return response.json();
     }).then((json) => {
       console.log(json,'sabfjnsdjgbn');
       if(json==undefined){
         return
       }
        this.setState({holidays:json })
     })
     .catch((error) => {
       console.log(error)
     });
   }


    render(){

        return(
          <View style={{flex:1,backgroundColor:'#fff'}}>

          <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'#142e5c'} networkActivityIndicatorVisible={false}    />
          </View>

        <View style={[{height:55,alignItems: 'center',flexDirection: 'row',paddingHorizontal: 10,backgroundColor:'#f2f2f2'}]}>
         <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',}}>
            <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}>
              <MaterialIcons name={'arrow-back'} size={25} color={'#000'} />
            </TouchableOpacity>
            <Text style={{color:'#000',marginLeft:10,fontSize:18,fontWeight:'700'}}>{i18n.t('holiday')} {i18n.t('calendar')}</Text>
         </View>
       </View>

       <View style={{flex:1,paddingBottom:10}}>

       <ScrollView >

       <View style={{paddingVertical:15,paddingHorizontal:10}}>
          <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',}}
            data={this.state.holidays}
            keyExtractor={(item,index) => {
              return index.toString();
            }}
            nestedScrollEnabled={true}
            renderItem={({item, index}) => (
              <View style={{paddingVertical: 10,flex:1,backgroundColor:(index+1)%2==0?'#f2f2f2':'#fff',flexDirection: 'row',borderWidth: 0.5,borderColor: '#f2f2f2',marginTop:index==0?5:0}}>
                <View style={{flex:1,borderRightWidth:1,borderColor:'#f2f2f2'}}>
                  <View style={{flex:1,alignItems: 'center',justifyContent: 'center',}}>
                    <Text  style={{ fontSize: 14,fontWeight: '400',color:'#000'}}>{item.name}</Text>
                  </View>
                </View>
                <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                  <Text  style={{ fontSize: 14,fontWeight: '400',color:'#000'}}>{item.date}</Text>
                </View>
              </View>
            )}
          />
       </View>

        </ScrollView>

        </View>




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
     elevation: 0,
     borderColor:'#fff'
    },
    triangleCorner: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderRightWidth: 30,
      borderTopWidth: 30,
      borderRightColor: 'transparent',
      borderTopColor: 'red',

    },
});
