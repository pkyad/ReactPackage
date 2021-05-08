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

const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

class EmployeeScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state
      return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={
      employeeList:[],
      loadmore:false,
      offset:0,
      SERVER_URL:null,
      bool:false
    }
     willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          this.getEmployeeListRefresh()
          this.changeVal()
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
    this.getEmployeeList()
  }

  getEmployeeList=async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    await fetch(SERVER_URL + '/api/HR/users/?offset='+this.state.offset+'&division=&limit=10&is_active=true', {
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
        var data = this.state.employeeList
        responseJson.results.forEach((i)=>{
          data.push(i)
        })
        if(responseJson.next==null){
          this.setState({loadmore:false})
        }else{
          this.setState({loadmore:true,offset:this.state.offset+10})
        }
        this.setState({employeeList:data})
      })
      .catch((error) => {
        return
      });
  }
  getEmployeeListRefresh=async()=>{
    console.log('dddd');
    this.setState({offset:0})
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    await fetch(SERVER_URL + '/api/HR/users/?offset=0&division=&limit=10&is_active=true', {
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
        responseJson.results.forEach((i)=>{
          data.push(i)
        })
        if(responseJson.next==null){
          this.setState({loadmore:false})
        }else{
          this.setState({loadmore:true,offset:10})
        }
        console.log(data.length);
        this.setState({employeeList:data})
      })
      .catch((error) => {
        return
      });
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

  render() {
    const { scanned } = this.state;
    return (
      <View style={{flex:1,backgroundColor:'#f3f3f3'}}>

            <Toast style={{backgroundColor:'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}}/>

            <View style={{flex:1}}>
              <View style={{height:55,backgroundColor:'#142e5c',}}>
                <View style={{flexDirection: 'row',height:55,alignItems: 'center',backgroundColor:'#142e5c'}}>
                   <TouchableOpacity onPress={()=>this.props.navigation.navigate('Main')} style={{ position:'absolute',left:0,top:0,bottom:0, justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
                     <MaterialIcons name={'keyboard-backspace'}size={30} color={'#fff'} />
                   </TouchableOpacity>
                   <Text style={{color:'#fff',marginLeft:width*0.15+10,fontSize:20,fontWeight:'700'}}>{i18n.t('manageemployeesaccount')}</Text>
                </View>
              </View>
              <ScrollView contentContainerStyle={{paddingBottom:20}}>
                <FlatList
                 data={this.state.employeeList}
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
                      <View >
                      <View style={{flex:1,backgroundColor:'#f2f2f2',borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                       <TouchableWithoutFeedback onPress={()=>{}}>
                         <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', width:width,margin:0,padding:0,backgroundColor:'#fff'}]}>
                            <View style={{height:'100%',}}>
                              <View style={{flex:1,flexDirection:'row',marginVertical:10}}>
                                <View style={{flex:0.25,alignItems:'center',justifyContent:'center'}}>
                                  <Image style={[{width:width*0.16,height:width*0.16,borderRadius:width*0.08,backgroundColor:'#f2f2f2'}]} source={logo.length>0?{uri:this.state.SERVER_URL+logo}:require('../assets/images/img_avatar_card.png')} />
                                </View>
                                <View style={{flex:0.75,justifyContent:'center'}}>
                                  <Text style={{color:'#000',fontSize:20,fontWeight:'700'}}>{item.first_name} {item.last_name}</Text>

                                  <View style={{flex:1,flexDirection:'row',marginVertical:5}}>
                                    <View style={{flex:0.1}}>
                                      <Entypo name="email" size={18} color="black" />
                                    </View>
                                    <View style={{flex:0.9}}>
                                        <Text style={{color:'#000',fontSize:16,fontWeight:'600'}}>{item.email}</Text>
                                    </View>
                                  </View>
                                  <View style={{flex:1,flexDirection:'row'}}>
                                    <View style={{flex:0.1}}>
                                      <FontAwesome name="mobile" size={24} color="black" />
                                    </View>
                                    <View style={{flex:0.9}}>
                                        <Text style={{color:'#000',fontSize:16,fontWeight:'600'}}>{item.profile.mobile}</Text>
                                    </View>
                                  </View>

                                </View>
                              </View>
                            </View>
                         </Card>
                         </TouchableWithoutFeedback>
                    </View>
                      </View>
                  )}}
                  />
              </ScrollView>
            </View>

            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('NewEmployee')}}  style={[styles.boxshadow,{position:'absolute',right:20,bottom:20,width:40,height:40,borderRadius:20,backgroundColor:'#f00',alignItems:'center',justifyContent:'center'}]}>
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


export default EmployeeScreen;
