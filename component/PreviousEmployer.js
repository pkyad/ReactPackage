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

const themeColor = settings.themeColor
const url = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

const { width,height } = Dimensions.get('window');

import Toast, {DURATION} from 'react-native-easy-toast'


const colorsList = ['red','blue','black','green']


const monthList = [{label:'April',value:'April'},{label:'May',value:'May'},{label:'June',value:'June'},{label:'July',value:'July'},{label:'Aug',value:'Aug'},{label:'Sept',value:'Sept'},{label:'Oct',value:'Oct'},{label:'Nov',value:'Nov'},{label:'Dec',value:'Dec'},{label:'Jan',value:'Jan'},{label:'Feb',value:'Feb'},{label:'March',value:'March'}]

export default class PreviousEmployer extends React.Component{

    static navigationOptions=({navigation})=>{
      const { params = {} } = navigation.state
      return {header:null}
    };

    constructor(props) {
      super(props);

      this.state = {
         SERVER_URL:'',
         yearsList:[],
         selectedYear:null,
         monthList:monthList,
         selectedMonth:null,
         prevEmpData:[]
      };
      willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
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

  getUniqueYears=async()=>{
    var user = await AsyncStorage.getItem('userpk')
    var serverurl = url+'/api/payroll/getUniqueYears/?id='+user
    var data = await HttpsClient.get(serverurl)

    if(data.type=='success'){
      var yearsList = []
      data.data.yearLists.forEach((i)=>{
        var obj = {label:i,value:i}
        yearsList.push(obj)
      })
      this.setState({yearsList})
      if(yearsList.length>0){
        this.setState({selectedYear:yearsList[yearsList.length-1],selectedMonth:monthList[0]})
        this.getData(yearsList[yearsList.length-1].value)
      }
    }else{
      return
    }
  }

   handleConnectivityChange=(state)=>{
    if(state.isConnected){
      this.getUniqueYears()
    }else{
      this.setState({connectionStatus : false})
      ToastAndroid.showWithGravityAndOffset('No Internet Connection',  ToastAndroid.LONG, ToastAndroid.CENTER,25,50);
    }
  }
  getData=async(year)=>{
      var user = await AsyncStorage.getItem('userpk')
      var serverurl = url+'/api/payroll/getITDeclaration/?user='+user+'&currentFinancialYear='+year
      var data = await HttpsClient.get(serverurl)
      if(data.type=='success'){
        console.log(data.data.prevEmpData,'data');
        data.data.prevEmpData.forEach((i)=>{
          i.inputAmount = i.amount
        })
        this.setState({prevEmpData:data.data.prevEmpData})
      }else{
        return
      }
  }

    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',paddingHorizontal:15,backgroundColor:'#142e5c'}}>
          <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{flex:0.15,alignItems:'center',justifyContent:'center'}}>
            <MaterialCommunityIcons name="keyboard-backspace" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{flex:0.7,justifyContent:'center',alignItems:'flex-start'}}>
            <Text style={{color:'#fff',fontSize:18,fontWeight:'700'}} >Income from previous Employer</Text>
          </View>
          <View style={{flex:0.15,}}>
          </View>
       </View>
      )
    }

    changeText=(text,index)=>{
      var data = this.state.prevEmpData
      data[index].inputAmount = text
      this.setState({prevEmpData:data})
    }

    save=async(item)=>{


    var sendData = {
      pk:item.pk,
      title:item.title,
      amount:item.inputAmount,
      limit:item.limit,
      group_name:item.group_name,
    }
    var serverurl = url+'/api/payroll/itDeclaration/'+item.pk+'/'
    var data = await HttpsClient.patch(serverurl,sendData)

    if(data.type=='success'){

    }else{
      return
    }
  }

  renderIdHeader=()=>{
  if(this.state.prevEmpData.length==0){
     return null
  }
   return(
     <View>
      <View style={{backgroundColor:'#b2b2b2',borderBottomWidth:1,borderColor:'#b2b2b2',flexDirection:'row'}}>
            <View style={{width:width*0.5,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#f2f2f2',paddingVertical:15,}}>
              <Text style={{fontSize:16,color:'#fff',fontWeight:'700'}}>Pay Item</Text>
            </View>
            <View style={{width:width*0.5,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#f2f2f2',paddingVertical:15,}}>
              <Text style={{fontSize:16,color:'#fff',fontWeight:'700'}}>Amount</Text>
            </View>
      </View>
      </View>
   )
 }

    render(){
        return(
          <View style={{flex:1,backgroundColor:"#E5E5E5"}}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}}>
               <StatusBar   translucent={true} barStyle="light-content" backgroundColor={'#142e5c'} networkActivityIndicatorVisible={false}    />
            </View>
            {this.renderHeader()}
            <View style={{flex:1,}}>
            <ScrollView>

            <View style={{flex:1,paddingHorizontal:10,paddingVertical:15}}>
            <FlatList
              data={this.state.prevEmpData}
              keyExtractor={(item,index) => {
                return index.toString();
              }}
              extraData={this.state.prevEmpData}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
               contentContainerStyle={{}}
              ListHeaderComponent={() => this.renderIdHeader()}
              renderItem={({item, index}) =>{
                console.log(item.data,this.state.selectedMonth);
                 return (
                   <View style={{backgroundColor:'#fff',borderBottomWidth:1,borderColor:'#f2f2f2',flexDirection:'row'}}>
                     <View style={{width:width*0.5,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#f2f2f2',height:51,backgroundColor:index%2==0?'#fff':'#fff'}}>
                       <Text style={{fontSize:14,color:'#000',fontWeight:'600'}}>{item.title}</Text>
                     </View>
                     <View style={{width:width*0.5,alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#f2f2f2',height:51,backgroundColor:index%2==0?'#fff':'#fff'}}>
                     <TextInput
                      style={{width:width*0.5,height:51,textAlign:'center'}}
                      onChangeText={(text)=>{this.changeText(text,index)}}
                      value={item.inputAmount.toString()}
                      placeholder="Amount"
                      keyboardType="numeric"
                      onSubmitEditing={()=>{this.save(item)}}
                    />
                     </View>
                   </View>
                 )}}
                 />
            </View>

             </ScrollView>

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
