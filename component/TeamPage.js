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
  ToastAndroid,RefreshControl,TouchableWithoutFeedback,Switch} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import {SearchBar}from 'react-native-elements';
import { FontAwesome,Entypo ,MaterialIcons,Ionicons,AntDesign} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import settings from './Constants.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import Carousel, { Pagination } from 'react-native-snap-carousel';
// import { Switch } from 'react-native-switch';
import Modal from "react-native-modal";
import { Searchbar } from 'react-native-paper';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Card } from 'react-native-elements';
import  { HttpsClient }  from './HttpsClient.js';

import { RadioButton } from 'react-native-paper';

const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

class TeamPage extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state
      return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={
      loadmore:false,
      offset:0,
      SERVER_URL:null,
      bool:false,
      teamList:[]
    }
     willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          this.changeVal()
          this.getTeamList()
        }
     );
    }

    changeVal=()=>{
      this.setState({bool:!this.state.bool})
    }

  setServerurl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
  }

  componentDidMount(){
    this.setServerurl()
    this.getTeamList()
    // this.getUser()
  }

  getUser=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    if(userToken == null){
      return
    }

    fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
      headers: {
         "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': csrf
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.designation!=null){
          this.getEmployeeList(responseJson.designation.division)
        }
      })
      .catch((error) => {
        return
      });
  }

  getTeamList=async(division)=>{
    // division=&designation__division=2&
    var url = SERVER_URL + '/api/HR/teamAll/'
    var data = await HttpsClient.get(url)
    console.log(data.data,'fnsdfj');
    if(data.type=='success'){
      this.setState({teamList:data.data})
    }else{
      return
    }
  }

  renderFooter=()=>{
    if(this.state.loadmore){
      return(
        <View style={{alignItems:'center',justifyContent:'center',marginTop:20}}>
          <TouchableOpacity style={{paddingHorizontal:15,paddingVertical:8,backgroundColor:themeColor}} onPress={()=>{this.getEmployeeList()}}>
            <Text style={{color:'#fff',fontSize:16}}>Load More</Text>
          </TouchableOpacity>
        </View>
      )
    }else{
      return null
    }

  }

  save=async(item,index)=>{

    var employeeList = this.state.employeeList
    var sendData = {
      isDashboard:!item.profile.isDashboard,
      bodyType:'formData'
    }
    var serverurl = SERVER_URL + '/api/HR/profileAdminMode/'+item.profile.pk+'/'
    var data = await HttpsClient.patch(serverurl,sendData)

    console.log(sendData,'dfbsbn',data,serverurl,item);
    if(data.type=='success'){
      employeeList[index].profile = data.data
      this.setState({employeeList})
    }else{
      return
    }

  }

  render() {
    const { scanned } = this.state;
    return (
      <View style={{flex:1,backgroundColor:'#f3f3f3'}}>

            <Toast style={{backgroundColor:'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}}/>

            <View style={{flex:1}}>
              <View style={{height:55,backgroundColor:'#f3f3f3',}}>
                <View style={{flexDirection: 'row',height:55,alignItems: 'center',backgroundColor:'#f3f3f3'}}>
                   <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{width:width*0.15,alignItems:'center',
                 justifyContent:'center'}}>
                     <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
                   </TouchableOpacity>
                   <View style={{width:width*0.85,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{color:'#252525',fontSize:20,fontWeight:'700',textAlign:'center',marginLeft:-(width*0.15)}}>Employees</Text>
                   </View>
                </View>
              </View>
              <ScrollView contentContainerStyle={{paddingBottom:20}}>
                <FlatList
                 data={this.state.teamList}
                 contentContainerStyle={{paddingBottom:60}}
                 keyExtractor={(item,index) => {
                   return index.toString();
                 }}
                 extraData={this.state}
                 showsVerticalScrollIndicator={false}
                 nestedScrollEnabled={true}
                 ListFooterComponent={this.renderFooter()}
                 renderItem={({item, index}) =>{
                    var logo =  ''
                    if(logo!=null&&logo!=undefined){
                      logo = item.logo
                    }
                    return (
                       <TouchableWithoutFeedback onPress={()=>{this.props.navigation.navigate('CreateTeam',{item:item})}} >
                          <View style={{borderRadius:25,backgroundColor:'#fff',marginVertical:12,paddingVertical:15,borderWidth:1,borderColor:'#e2e2e2'}}>
                              <View style={{flexDirection:'row',paddingHorizontal:15}}>
                                <View style={{flex:0.8,flexDirection:'row',}}>
                                  <View style={{flex:1,}}>
                                    <Text style={{color:'#252525',fontSize:18,fontWeight:'700',}}>#{item.pk} {item.title}</Text>
                                  </View>
                                </View>
                                <View style={{flex:0.2,alignItems:'center'}}>

                                </View>
                              </View>
                              <View style={{flex:1,paddingHorizontal:15,marginTop:5}}>
                                <Text style={{color:'#252525',fontSize:18,fontWeight:'700',}}>TeamLead : {item.manager!=null?item.manager.first_name:''} {item.manager!=null?item.manager.last_name:''}</Text>
                                <Text style={{color:'#252525',fontSize:18,fontWeight:'700',marginTop:5}}>Team Members</Text>
                                {item.members.map((i,idx)=>{
                                  return(
                                    <Text style={{color:'#252525',fontSize:16,fontWeight:'600',marginTop:5}}>{idx+1}. {i.user.first_name} {i.user.last_name}</Text>
                                  )
                                })

                                }
                              </View>
                            </View>
                         </TouchableWithoutFeedback>
                  )}}
                  />
              </ScrollView>
            </View>

            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('CreateTeam')}}  style={[styles.boxshadow,{position:'absolute',right:20,bottom:20,width:46,height:46,borderRadius:23,backgroundColor:'grey',alignItems:'center',justifyContent:'center'}]}>
             <AntDesign name={'plus'} size={20} color={'#fff'}/>
            </TouchableOpacity>

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


export default TeamPage;
