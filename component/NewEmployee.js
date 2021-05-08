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
  ToastAndroid,RefreshControl,TouchableWithoutFeedback,Picker} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import {SearchBar}from 'react-native-elements';
import { FontAwesome,Entypo ,MaterialIcons,Ionicons,AntDesign} from '@expo/vector-icons';
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
import DropDownPicker from 'react-native-dropdown-picker';

const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

class NewEmployee extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state
      return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={
      SERVER_URL:null,
      email:'',
      first_name:'',
      last_name:'',
      mobile:'',
      reportingTo:null,
      role:null,
      unit:null,
      username:'',
      workLocationList:[],
      reportingToList:[],
      rollList:[],
      selectedWorkLocation:null,
      selectedReportingTo:null,
      selectedRole:null,
    }
     willFocus = props.navigation.addListener(
       'didFocus',
        payload => {

        }
     );
    }

  setServerurl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
    this.getRoleList()
    this.getWorkLocationList()
    this.getReportingToList()
  }

  getRoleList=async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    await fetch(SERVER_URL + '/api/organization/role/', {
      method:"GET",
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken':csrf,
        'Referer': SERVER_URL,
      },
      'credentials': 'same-origin'
    }).then((response) => response.json())
      .then((responseJson) => {
        if(responseJson==undefined){
          return
        }
        var data = []
        responseJson.forEach((i)=>{
          var obj = {label:i.name,value:i.pk,pk:i.pk}
          data.push(obj)
        })
        console.log(data,'rolelist');
        if(data.length>0){
          this.setState({selectedRole:data[0]})
        }
        this.setState({rollList:data})
      })
      .catch((error) => {
        return
      });
  }

  getWorkLocationList=async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    await fetch(SERVER_URL + '/api/organization/unit/', {
      method:"GET",
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken':csrf,
        'Referer': SERVER_URL,
      },
      'credentials': 'same-origin'
    }).then((response) => response.json())
      .then((responseJson) => {
        if(responseJson==undefined){
          return
        }
        var data = []
        responseJson.forEach((i)=>{
          var obj = {label:i.name,value:i.pk,pk:i.pk}
          data.push(obj)
        })
        if(data.length>0){
          this.setState({selectedWorkLocation:data[0]})
        }
        this.setState({workLocationList:data})
      })
      .catch((error) => {
        return
      });
  }

  getReportingToList=async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    await fetch(SERVER_URL + '/api/HR/users/?is_active=true&division=', {
      method:"GET",
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken':csrf,
        'Referer': SERVER_URL,
      },
      'credentials': 'same-origin'
    }).then((response) => response.json())
      .then((responseJson) => {
        if(responseJson==undefined){
          return
        }
        var data = []
        responseJson.forEach((i)=>{
          var obj = {label:i.first_name+i.last_name,value:i.pk,pk:i.pk}
          data.push(obj)
        })
        if(data.length>0){
          this.setState({selectedReportingTo:data[0]})
        }
        this.setState({reportingToList:data})
      })
      .catch((error) => {
        return
      });
  }

  componentDidMount(){
    this.setServerurl()
  }



  createUser=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    if(this.state.first_name.length==0){
      ToastAndroid.showWithGravityAndOffset('Enter First Name',ToastAndroid.SHORT,ToastAndroid.CENTER,25,50);
      return
    }
    if(this.state.last_name.length==0){
      ToastAndroid.showWithGravityAndOffset('Enter Last Name',ToastAndroid.SHORT,ToastAndroid.CENTER,25,50);
      return
    }
    if(this.state.email.length==0){
      ToastAndroid.showWithGravityAndOffset('Enter Email',ToastAndroid.SHORT,ToastAndroid.CENTER,25,50);
      return
    }
    if(this.state.mobile.length==0){
      ToastAndroid.showWithGravityAndOffset('Enter Mobile',ToastAndroid.SHORT,ToastAndroid.CENTER,25,50);
      return
    }
    var dataSend ={
      email:this.state.email,
      first_name:this.state.first_name,
      last_name:this.state.last_name,
      mobile:this.state.mobile,
      role:this.state.selectedRole.value,
      unit:this.state.selectedWorkLocation.value,
      username:this.state.mobile,
      reportingTo:this.state.selectedReportingTo.value
    }
    // console.log(dataSend,'reportingTo');
    // return
      fetch(SERVER_URL+'/api/HR/userCreate/', {
        method: 'POST',
        headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Content-Type': 'application/json',
          'X-CSRFToken':csrf,
          'Referer': SERVER_URL,
        },
        body:JSON.stringify(dataSend),
      }).then((response) =>{
        console.log(response.status,'KKKKKKKKKKKKKKKKKK');
        if(response.status == '200'||response.status == '201'){
          this.props.navigation.goBack()
          return response.json();
        }
      }).then((json) => {
          console.log(json,'response added company address');
      })
      .catch((error) => {
        console.log(error)
      });
  }

  render() {
    const { scanned } = this.state;
    let roleList = this.state.rollList.map( (s, i) => {
           return <Picker.Item key={i} value={s.value} label={s.label} />
       });
    let workLocationList = this.state.workLocationList.map( (s, i) => {
           return <Picker.Item key={i} value={s.value} label={s.label} />
       });
    let reportingToList = this.state.reportingToList.map( (s, i) => {
           return <Picker.Item key={i} value={s.value} label={s.label} />
       });
    return (
      <View style={{flex:1,backgroundColor:'#fff'}}>

            <Toast style={{backgroundColor:'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}}/>

            <View style={{flex:1}}>
              <View style={{height:55,backgroundColor:'#fff',}}>
                <View style={{flexDirection: 'row',height:55,alignItems: 'center',backgroundColor:'#fff'}}>
                   <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{ position:'absolute',left:0,top:0,bottom:0, justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
                     <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
                   </TouchableOpacity>
                   <Text style={{color:'#252525',marginLeft:width*0.15+10,fontSize:20,fontWeight:'700'}}>Add Team Member</Text>
                </View>
              </View>

              <ScrollView contentContainerStyle={{paddingBottom:20}}>

              <View style={{borderWidth:0,paddingHorizontal:15}}>
                <Text style={{fontSize:16,paddingVertical:10}}>First Name</Text>
                <TextInput
                   style={{fontSize:16,height:45,borderWidth:1,borderColor:'#F3F6FB',borderRadius:7,borderColor:'#F3F6FB',borderWidth:1,borderRadius:7,backgroundColor:'#F3F6FB',paddingHorizontal:10}}
                   value={this.state.first_name}
                   onChangeText={(first_name)=>{this.setState({first_name})}}>
                </TextInput>
               </View>

              <View style={{borderWidth:0,paddingHorizontal:15}}>
                <Text style={{fontSize:16,paddingVertical:10}}>Last Name</Text>
                <TextInput
                   style={{fontSize:16,height:45,borderWidth:1,borderColor:'#F3F6FB',borderRadius:7,borderColor:'#F3F6FB',borderWidth:1,borderRadius:7,backgroundColor:'#F3F6FB',paddingHorizontal:10}}
                   value={this.state.last_name}
                   onChangeText={(last_name)=>{this.setState({last_name})}}>
                </TextInput>
               </View>

              <View style={{borderWidth:0,paddingHorizontal:15}}>
                <Text style={{fontSize:16,paddingVertical:10}}>Email</Text>
                <TextInput
                   style={{fontSize:16,height:45,borderWidth:1,borderColor:'#F3F6FB',borderRadius:7,borderColor:'#F3F6FB',borderWidth:1,borderRadius:7,backgroundColor:'#F3F6FB',paddingHorizontal:10}}
                   value={this.state.email}
                   onChangeText={(email)=>{this.setState({email})}}>
                </TextInput>
               </View>

              <View style={{borderWidth:0,paddingHorizontal:15}}>
                <Text style={{fontSize:16,paddingVertical:10}}>Mobile</Text>
                <TextInput
                   style={{fontSize:16,height:45,borderWidth:1,borderColor:'#F3F6FB',borderRadius:7,borderColor:'#F3F6FB',borderWidth:1,borderRadius:7,backgroundColor:'#F3F6FB',paddingHorizontal:10}}
                   value={this.state.mobile}
                   keyboardType={'numeric'}
                   onChangeText={(mobile)=>{this.setState({mobile})}}>
                </TextInput>
               </View>

              <View style={{borderWidth:0,paddingHorizontal:15}}>
                <Text style={{fontSize:16,paddingVertical:10}}>Role</Text>
                <View style={{ height:45,width:'100%',borderColor:'#F3F6FB',borderWidth:1,borderRadius:7  }}>
                  <Picker
                      selectedValue={this.state.selectedRole!=null?this.state.selectedRole.value:null}
                      mode="dropdown"
                      style={{ height: 45, width: '100%' }}
                      onValueChange={ (itemValue, itemIndex) =>{this.setState({selectedRole:this.state.rollList[itemIndex]})}} >
                      {roleList}
                  </Picker>
                </View>
            </View>

            <View style={{borderWidth:0,paddingHorizontal:15}}>
              <Text style={{fontSize:16,paddingVertical:10}}>Reporting To</Text>
              <View style={{ height:45,width:'100%',borderColor:'#F3F6FB',borderWidth:1,borderRadius:7  }}>
                <Picker
                    selectedValue={this.state.selectedReportingTo!=null?this.state.selectedReportingTo.value:null}
                    mode="dropdown"
                    style={{ height: 45, width: '100%' }}
                    onValueChange={ (itemValue, itemIndex) =>{this.setState({selectedReportingTo:this.state.reportingToList[itemIndex]})}} >
                    {reportingToList}
                </Picker>
              </View>
            </View>

            <View style={{borderWidth:0,paddingHorizontal:15}}>
              <Text style={{fontSize:16,paddingVertical:10}}>Work Location</Text>
              <View style={{ height:45,width:'100%',borderColor:'#F3F6FB',borderWidth:1,borderRadius:7  }}>
                <Picker
                    selectedValue={this.state.selectedWorkLocation!=null?this.state.selectedWorkLocation.value:null}
                    mode="dropdown"
                    style={{ height: 45, width: '100%' }}
                    onValueChange={ (itemValue, itemIndex) =>{this.setState({selectedWorkLocation:this.state.workLocationList[itemIndex]})}} >
                    {workLocationList}
                </Picker>
              </View>
            </View>

            <View style={{alignItems:'center',justifyContent:'center',marginVertical:25}}>
              <TouchableOpacity onPress={()=>{this.createUser()}} style={{paddingVertical:10,paddingHorizontal:25,backgroundColor:'#132E5B',borderRadius:10}}>
                <Text style={{color:'#fff',fontSize:18,fontWeight:'700'}}>Create</Text>
              </TouchableOpacity>
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


export default NewEmployee;
