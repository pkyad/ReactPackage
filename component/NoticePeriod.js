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
import { FontAwesome,Entypo ,MaterialIcons,Ionicons,AntDesign,MaterialCommunityIcons} from '@expo/vector-icons';
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
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { RadioButton } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url


const url = settings.url

import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

class NoticePeriod extends React.Component {

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
      employeeList:[],
      modelShow:false,
      date:moment(new Date()).format('YYYY-MM-DD'),
      userName:'',
      selectedEmployee:'',
      show:false,
      deboardList:[]
    }
     willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          this.changeVal()
          this.getEmployeeList()
        }
     );
    }

    changeVal=()=>{
      this.setState({bool:!this.state.bool})
    }

    addDeboard=async()=>{

      if(this.state.userName.length==0){
        this.toast.show('Enter userName Name',2000);
        return
      }
      if(this.state.selectedEmployee==null){
        this.toast.show('Select Employee',2000);
        return
      }

      var sendData = {
        lastWorkingDate:this.state.date,
        user:this.state.selectedEmployee.pk,
      }

      var serverurl = url + '/api/HR/exitManagement/'
      var data = await HttpsClient.post(serverurl,sendData)

      console.log(sendData,'dfbsbn',data,serverurl);
      if(data.type=='success'){
        var item = this.state.deboardList
        item.push(data.data)
        this.setState({deboardList:item,modalShow:false,employeeList:[]})
        // this.getEmployeeList()
      }else{
        return
      }

    }

    exitEmployee = (item,index)=>{
     Alert.alert(
         'Exit',
         'Are you sure?',
         [
           {text: 'Cancel', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.exitEmployeeFunc(item,index)
           }},
         ],
         { cancelable: false }
       )
   }

    exitEmployeeFunc=async(item,index)=>{
      var sendData = {
        is_exited:true,
      }
      var serverurl = url + '/api/HR/exitManagement/'+item.pk+'/'
      var data = await HttpsClient.patch(serverurl,sendData)

      console.log(sendData,'dfbsbn',data,serverurl);
      if(data.type=='success'){
        var item = this.state.deboardList
        item.splice(index,1)
        this.setState({deboardList:item})
      }else{
        return
      }

    }

    setEmployeeList=(item)=>{
      this.setState({selectedEmployee:item,userName:item.first_name+' '+item.last_name,show:false,employeeList:[]})
    }

  setServerurl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
  }
  renderModal=()=>{
   if(this.state.modalShow){
     return(
       <Modal isVisible={this.state.modalShow} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{this.setState({modalShow:false})}} onBackdropPress={()=>{this.setState({modalShow:false})}} >
           <View style={[styles.modalViewUpdate,{overflow:'hidden',}]}>
           <ScrollView>
            <View style={{}}>
                <Text style={{marginHorizontal:15,marginVertical:10,fontWeight:'700',fontSize:18}}>Deboarding Employee</Text>
                <View style={{}}>
                 <View style={{flexDirection:'row',}}>
                 <View style={{marginHorizontal:25,marginVertical:10}}>
                   <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Select the Deboarding Employee</Text>
                   <View style={{flexDirection:'row',}}>
                        <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                          placeholder="Search Employee"
                          selectionColor={'#000'}
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          onChangeText={query => { this.getUsers(query)  }}
                          value={this.state.userName.toString()}
                         />
                   </View>


                   <View style={{flexDirection:'row',marginTop:5}}>
                     <View style={{flex:1}} >
                       {this.state.show&&this.state.employeeList.length>0&&
                         <View style={{}}>
                           <View style={{}}>
                             <FlatList contentContainerStyle={{borderWidth:1,borderColor:'#F3F6FB',borderRadius:10,borderTopWidth:0,}}
                             data={this.state.employeeList}
                             keyExtractor={(item, index) => index.toString()}
                             renderItem={({item,index})=>{
                             return(
                               <View style={{marginVertical:0,backgroundColor:'#F3F6FB',borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center'}} >
                                 <TouchableOpacity onPress={()=>{this.setEmployeeList(item)}}>
                                   <View  style={{}} >
                                     <Text style={{color:'#000',fontSize:16,fontWeight:'600'}} numberOfLines={2}>{item.first_name} {item.last_name}</Text>
                                   </View>
                                 </TouchableOpacity>
                               </View>
                             )}}
                             />
                           </View>
                         </View>
                       }
                     </View>
                   </View>
                 </View>
                 </View>
               </View>
               <View style={{paddingVertical:15,paddingHorizontal:25,}}>
                 <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Select last working day of employee</Text>
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
               <View style={{flexDirection:'row',marginVertical:10,marginBottom:20}}>
                  <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity onPress={()=>{this.setState({modalShow:false})}} style={{backgroundColor:'#B50000',paddingHorizontal:25,paddingVertical:7,borderRadius:10}}>
                      <Text style={{color:'#fff',fontSize:18,}}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity onPress={()=>{this.addDeboard()}} style={{backgroundColor:'#132E5B',paddingHorizontal:25,paddingVertical:7,borderRadius:10}}>
                      <Text style={{color:'#fff',fontSize:18,}}>Save</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>
           </ScrollView>
           </View>
         </Modal>
     )
   }else{
     return null
   }


}


  componentDidMount(){
    this.setServerurl()
    this.getEmployeeList()
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
          this.getEmployeeList()
        }
      })
      .catch((error) => {
        return
      });
  }

  getEmployeeList=async()=>{
    // division=&designation__division=2&
    var url = SERVER_URL + '/api/HR/exitManagement/?is_exited=false'
    var data = await HttpsClient.get(url)
    console.log(data.data,'fnsdfj');
    if(data.type=='success'){
      this.setState({deboardList:data.data})
    }else{
      return
    }
  }

  // getUsers=async(query)=>{
  //   this.setState({ userName: query });
  //     var serverurl = url + '/api/HR/users/?is_active=true&limit=10&division=&first_name__icontains='+query
  //     var data = await HttpsClient.get(serverurl)
  //     console.log(data,'hdfhdfhs');
  //     if(data.type=='success'){
  //       if(data.data.length>0){
  //         this.setState({teamList:data.data,show:true})
  //       }else{
  //         this.setState({show:false,teamList:[]})
  //       }
  //     }else{
  //       return
  //     }
  // }


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

  getUsers=async(query)=>{
    this.setState({ userName: query });
    if(query.length==0){
      this.setState({employeeList:[],show:false})
      return
    }
      var serverurl = url + '/api/HR/users/?is_active=true&limit=10&division=&first_name__icontains='+query
      var data = await HttpsClient.get(serverurl)
      console.log(data);
      if(data.type=='success'){
        if(data.data.results.length>0){
          this.setState({employeeList:data.data.results,show:true})
        }else{
          this.setState({show:false,employeeList:[]})
        }
      }else{
        return
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
                    <Text style={{color:'#252525',fontSize:20,fontWeight:'700',textAlign:'center',marginLeft:-(width*0.15)}}>Notice Period</Text>
                   </View>
                </View>
              </View>
              <ScrollView contentContainerStyle={{paddingBottom:20}}>
                <FlatList
                 data={this.state.deboardList}
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
                       <TouchableWithoutFeedback onPress={()=>{}} >
                          <View style={{borderRadius:25,backgroundColor:'#fff',marginVertical:12,paddingVertical:15,borderWidth:1,borderColor:'#e2e2e2'}}>
                              <View style={{flexDirection:'row',}}>
                                <View style={{flex:0.2,alignItems:'center'}}>
                                  <Image source={item.user.profile.displayPicture==null?null:{uri:item.user.profile.displayPicture}} style={{height:width*0.14,width:width*0.14,borderRadius:width*0.07,backgroundColor:'#f2f2f2'}} />
                                </View>
                                <View style={{flex:0.8,flexDirection:'row',}}>
                                  <View style={{flex:1,}}>
                                    <View style={{flexDirection:'row',paddingBottom:10}}>
                                      <View style={{flex:1,}}>
                                        <Text style={{color:'#000',fontSize:16,fontWeight:'700'}} numberOfLines={3}>{item.user.first_name} {item.user.last_name}</Text>
                                      </View>
                                      <View style={{flex:1,paddingHorizontal:5,alignItems:'center'}}>
                                        <Text style={{color:'#909090',fontSize:14,fontWeight:'600',paddingBottom:5}}>{item.user.designation.unit!=null?item.user.designation.unit.name:''} {item.user.designation.unit!=null?item.user.designation.unit.city:''}</Text>
                                      </View>
                                    </View>
                                    <View style={{flexDirection:'row',paddingBottom:10}}>
                                      <View style={{flex:1,flexDirection:'row'}}>
                                          <MaterialCommunityIcons name="email-outline" size={20} color="#252525" />
                                          <Text style={{color:'#252525',fontSize:14,fontWeight:'600',paddingHorizontal:4}}>{item.user.email}</Text>
                                      </View>
                                      <View style={{flex:1,paddingHorizontal:5,alignItems:'center'}}>
                                        <Text style={{color:'#909090',fontSize:14,fontWeight:'600',}}>Last Working Day</Text>
                                      </View>
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                      <View style={{flex:1,flexDirection:'row'}}>
                                        <FontAwesome name="mobile" size={20} color="#252525" />
                                        <Text style={{color:'#252525',fontSize:16,fontWeight:'600',paddingHorizontal:4}}>{item.user.profile.mobile}</Text>
                                      </View>
                                      <View style={{flex:1,paddingHorizontal:5,alignItems:'center'}}>
                                        <Text style={{color:'#252525',fontSize:14,fontWeight:'600',paddingHorizontal:4}}>{item.lastWorkingDate}</Text>
                                      </View>
                                    </View>
                                    <View style={{flexDirection:'row',marginTop:15}}>
                                      <View style={{flex:0.6,paddingHorizontal:5,}}>
                                        <Text style={{color:'#252525',fontSize:16,fontWeight:'600',paddingHorizontal:4}}>Relieving letter</Text>
                                      </View>
                                      <View style={{flex:0.2,paddingHorizontal:5,alignItems:'center'}}>
                                        <View style={{paddingHorizontal:15,alignItems:'center',justifyContent:'center',backgroundColor:'#2C5AA7',paddingVertical:6,borderRadius:10}}>
                                          <AntDesign name="upload" size={20} color="#fff" />
                                        </View>
                                      </View>
                                      <View style={{flex:0.2,paddingHorizontal:5,alignItems:'center'}}>
                                        <AntDesign name="download" size={24} color="#2C5AA7" />
                                      </View>
                                    </View>
                                    <View style={{flexDirection:'row',marginTop:15}}>
                                      <View style={{flex:0.6,paddingHorizontal:5,}}>
                                        <Text style={{color:'#252525',fontSize:16,fontWeight:'600',paddingHorizontal:4}}>Full Final Settlement Doc</Text>
                                      </View>
                                      <View style={{flex:0.2,paddingHorizontal:5,alignItems:'center'}}>
                                        <View style={{paddingHorizontal:15,alignItems:'center',justifyContent:'center',backgroundColor:'#2C5AA7',paddingVertical:6,borderRadius:10}}>
                                          <AntDesign name="upload" size={20} color="#fff" />
                                        </View>
                                      </View>
                                      <View style={{flex:0.2,paddingHorizontal:5,alignItems:'center'}}>
                                        <AntDesign name="download" size={24} color="#2C5AA7" />
                                      </View>
                                    </View>
                                    <View style={{flexDirection:'row',marginTop:15}}>
                                      <View style={{flex:0.6,paddingHorizontal:5,}}>
                                        <Text style={{color:'#252525',fontSize:16,fontWeight:'600',paddingHorizontal:4}}>Experience letter</Text>
                                      </View>
                                      <View style={{flex:0.2,paddingHorizontal:5,alignItems:'center'}}>
                                        <View style={{paddingHorizontal:15,alignItems:'center',justifyContent:'center',backgroundColor:'#2C5AA7',paddingVertical:6,borderRadius:10}}>
                                          <AntDesign name="upload" size={20} color="#fff" />
                                        </View>
                                      </View>
                                      <View style={{flex:0.2,paddingHorizontal:5,alignItems:'center'}}>
                                        <AntDesign name="download" size={24} color="#2C5AA7" />
                                      </View>
                                    </View>
                                    <View style={{marginTop:15,alignItems:'flex-end',paddingHorizontal:15}}>
                                      <View style={{paddingHorizontal:5,alignItems:'center'}}>
                                        <TouchableOpacity onPress={()=>this.exitEmployee(item,index)} style={{paddingHorizontal:15,alignItems:'center',justifyContent:'center',backgroundColor:'#B50000',paddingVertical:6,borderRadius:10}}>
                                        <Text style={{color:'#fff',fontSize:18,fontWeight:'600',paddingHorizontal:4}}>Exit Employee</Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  </View>
                                </View>

                              </View>
                            </View>
                         </TouchableWithoutFeedback>
                  )}}
                  />
              </ScrollView>
            </View>
            <TouchableOpacity onPress={()=>{this.setState({modalShow:true})}}  style={[styles.boxshadow,{position:'absolute',right:20,bottom:20,width:46,height:46,borderRadius:23,backgroundColor:'grey',alignItems:'center',justifyContent:'center'}]}>
             <AntDesign name={'plus'} size={20} color={'#fff'}/>
            </TouchableOpacity>
            {this.renderModal()}

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
  modalViewUpdate: {
   backgroundColor: '#fff',
   marginHorizontal: width*0.05 ,
   borderRadius:5,
  },
});


export default NoticePeriod;
