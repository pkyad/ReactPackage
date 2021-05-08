import React, { Component }  from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,StatusBar,Vibration,TouchableWithoutFeedback,TextInput,ViewPropTypes,Switch
} from 'react-native';
import { FontAwesome,FontAwesome5,MaterialCommunityIcons,Feather,MaterialIcons,Octicons ,AntDesign ,Entypo} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card ,CheckBox } from 'react-native-elements';
import  ModalBox from 'react-native-modalbox';
import Modal from "react-native-modal";
import {SearchBar}from 'react-native-elements';
import moment from 'moment';
import MapView from 'react-native-maps';

import * as  ImagePicker  from 'expo-image-picker';
import { StackNavigator } from 'react-navigation';
import GradientButton from "react-native-gradient-buttons";
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
const { width,height } = Dimensions.get('window');
import  { HttpsClient }  from './HttpsClient.js';
import settings from './Constants.js';
import DropDownPicker from 'react-native-dropdown-picker';
const url = settings.url

class EmployeeProfile extends React.Component{

  static navigationOptions=({navigation})=>{
    const { params = {} } = navigation.state
    return {header:null}
  };


    constructor(props) {
      super(props);
      var item = props.navigation.getParam('item',null)
      var id=''
      var first_name=''
      var last_name=''
      var activePayroll=false
      var email=''
      var mobile=''
      var reportingTo=null
      var selectedRole=null
      var selectedUnitList=null
      var professionalTax=''
      var hra=''
      var lta = ''
      var fixedVariable = ''
      var specialAllowance = ''
      var basicDA = ''
      var statutoryBonus = ''
      var companyContribution = ''
      var employeeContribution = ''
      var universalAccountNo = ''
      var pfAccountNo = ''
      var al = ''
      var ml = ''
      var is_staff = false

      if(item!=null){
        id=''
        first_name=item.first_name
        last_name=item.last_name
        is_staff=item.is_staff
        activePayroll=false
        email=item.email
        mobile=item.profile.mobile
        reportingTo=null
        selectedRole=null
        selectedUnitList=null
        al=item.payroll.al==null?al:item.payroll.al
        ml=item.payroll.ml==null?ml:item.payroll.ml
      }
      this.state = {
         SERVER_URL:'',
         id:id,
         first_name:first_name,
         last_name:last_name,
         activePayroll:activePayroll,
         email:email,
         mobile:mobile,
         show:false,
         unitList:[],
         selectedRole:selectedRole,
         selectedUnitList:selectedUnitList,
         reportingTo:reportingTo,
         roleList:[],
         reportingToList:[],
         hra:hra,
         lta:lta,
         fixedVariable:fixedVariable,
         specialAllowance:specialAllowance,
         basicDA:basicDA,
         statutoryBonus:statutoryBonus,
         companyContribution:companyContribution,
         employeeContribution:employeeContribution,
         professionalTax:professionalTax,
         universalAccountNo:universalAccountNo,
         pfAccountNo:pfAccountNo,
         al:al,
         ml:ml,
         is_staff:is_staff,
         item:item,
         ctc:0,
         payroll:null,
         apps:[],
         modalShow:false,
         applicationName:'',
         searchList:[],
         show:false,
         selectedApp:null,
         designation:null
      };
      willFocus = props.navigation.addListener(
     'didFocus',
       payload => {

         }
      );
  }

    setUrl=async()=>{
      var SERVER_URL =  await AsyncStorage.getItem('SERVER_URL');
      this.setState({SERVER_URL})
    }

    componentDidMount=()=>{
      this.setUrl()
      this.getUser()
      this.getUnit()
      this.getRole()
      this.getDetails()
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
             this.setState({designation:responseJson.designation.pk})
           }
         })
         .catch((error) => {
           return
         });
     }

    attachShow=async()=>{
 const { status, expires, permissions } = await Permissions.getAsync(
     Permissions.CAMERA_ROLL,
     Permissions.CAMERA
   );

   if(permissions.camera.status == 'granted'){
     if(permissions.mediaLibrary.status == 'granted'){
       this.setState({openImageModal:true})
     }else{
       this.getCameraRollAsync()
     }
   }else{
     this.getCameraAsync()
   }
}

getCameraAsync=async()=> {

 const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
 if (status === 'granted') {
   this.attachShow()
 } else {
   throw new Error('Camera permission not granted');
 }
}

getCameraRollAsync=async()=> {

 const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
 if (status === 'granted') {
 this.attachShow()
 } else {
 throw new Error('Gallery permission not granted');
 }
}
handlePhoto = async () => {
     let picture = await ImagePicker.launchCameraAsync({
         mediaTypes:ImagePicker.MediaTypeOptions.Images,
         quality: 0.1,
       });
     if(picture.cancelled == true){
       return
     }

     let filename = picture.uri.split('/').pop();
     let match = /\.(\w+)$/.exec(filename);
     let type = match ? `image/${match[1]}` : `image`;

     const photo = {
       uri: picture.uri,
       type: type,
       name:filename,
     };
     this.setState({openImageModal:false})
     if(this.state.selectedImage=='image1'){
       this.setState({img1:photo})
     }else if(this.state.selectedImage=='image2'){
       this.setState({img2:photo})
     }else{
       this.setState({img3:photo})
     }


}

removeAttachment=(type)=>{
  if(type=='image1'){
    this.setState({img1:null})
  }else if(type=='image2'){
    this.setState({img2:null})
  }else{
    this.setState({img3:null})
  }
}

_pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsMultipleSelection: true
      });
      if(result.cancelled == true){
        return
      }

      let filename = result.uri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      var type = match ? `image/${match[1]}` : `image`;
      const photo = {
         uri: result.uri,
         type: type,
         name:filename,
      };

      this.setState({openImageModal:false})
      if(this.state.selectedImage=='image1'){
        this.setState({img1:photo})
      }else if(this.state.selectedImage=='image2'){
        this.setState({img2:photo})
      }else{
        this.setState({img3:photo})
      }
};


    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
           <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
            <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
           </TouchableOpacity>
           <View style={{width:width*0.7,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#252525',fontSize:20,fontWeight:'700'}}>Employee Profile</Text>
           </View>
          <View style={{width:width*0.15}} />
       </View>
      )
    }

    save=async()=>{

      if(this.state.teamName.length==0){
        this.toast.show('Enter Team Name',2000);
        return
      }
      if(this.state.teamLead==null){
        this.toast.show('Select Team Lead',2000);
        return
      }
      if(this.state.selectedUnitList==null){
        this.toast.show('Select Team Unit',2000);
        return
      }

      var sendData = {
        isOnSupport:this.state.isSupport,
        manager:this.state.teamLead.pk,
        title:this.state.teamName,
        unit:this.state.selectedUnitList.value,
      }


      if(this.state.editItem!=null){
        var serverurl =url + '/api/HR/team/'+this.state.editItem.pk+'/'
        var data = await HttpsClient.patch(serverurl,sendData)
      }else{
        var serverurl =url + '/api/HR/team/'
        var data = await HttpsClient.post(serverurl,sendData)
      }
      // return



      if(data.type=='success'){
        this.props.navigation.goBack()
      }else{
        return
      }

    }

    getUnit=async()=>{

      var serverurl =url + '/api/organization/unit/?icansee='
      var data = await HttpsClient.get(serverurl)

      if(data.type=='success'){
        var arr = []
        data.data.forEach((item, i) => {
          var obj = {label:item.name,value:item.pk}
          arr.push(obj)
        });
        this.setState({unitList:arr})
        if(arr.length>0){
          this.setState({selectedUnitList:arr[0]})
        }
      }else{
        return
      }
    }

    getDetails=async()=>{

      var serverurl =url + '/api/HR/updatePayrollDesignationMasterAcc/?id='+this.state.item.pk
      var data = await HttpsClient.get(serverurl)

      console.log('dfbsbn',data,serverurl);
      if(data.type=='success'){
        var payroll = data.data.payroll
        var apps = data.data.apps
        apps.push({pk:undefined})
        this.setState({payroll:payroll,hra:payroll.hra,specialAllowance:payroll.special,lta:payroll.lta,activePayroll:payroll.activatePayroll,basicDA:payroll.basic,fixedVariable:payroll.adHoc,statutoryBonus:payroll.bonus,companyContribution:payroll.pfAdmin,employeeContribution:payroll.pfAmnt,professionalTax:payroll.pTax,ctc:payroll.ctc,apps:apps})
      }else{
        return
      }
    }

    getRole=async()=>{

      var serverurl =url + '/api/organization/role/'
      var data = await HttpsClient.get(serverurl)

      if(data.type=='success'){
        var arr = []
        data.data.forEach((item, i) => {
          var obj = {label:item.name,value:item.pk}
          arr.push(obj)
        });
        this.setState({roleList:arr})
        if(arr.length>0){
          this.setState({selectedRole:arr[0]})
        }
      }else{
        return
      }
    }

    setTeamList=(item)=>{
      this.setState({teamLead:item,teamLeadName:item.first_name+' '+item.last_name,show:false,teamList:[]})
    }

    modalAttach =async (event) => {
      if(event == 'gallery') return this._pickImage();
      if(event == 'camera'){
          this.handlePhoto()
      }
    };

    renderModal=()=>{
  return(
          <Modal
              isVisible={this.state.openImageModal}
              hasBackdrop={true}
              style={[styles.modalView1,{position:'absolute',bottom:-20,left:0,right:0}]}
              onBackdropPress={()=>{this.setState({openImageModal:false});}} useNativeDriver={true} onRequestClose={()=>{this.setState({openImageModal:false});}} >
              <View style={{flexDirection:'row',}}>
                  <TouchableOpacity onPress={()=>{this.modalAttach('gallery')}} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                    <FontAwesome
                        name="folder"
                        size={width*0.16}
                        style={{marginRight:5,color:'#373737',
                                textAlign: 'center'}} />
                        <Text   style={{fontSize:16,color:'#373737',textAlign:'center'}}>Gallary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.modalAttach('camera')}} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                    <FontAwesome
                        name="camera"
                        size={width*0.14}
                        style={{color:'#373737',textAlign: 'center',}}
                        />
                    <Text   style={{fontSize:16,color:'#373737',textAlign:'center',}}>camera</Text>
                  </TouchableOpacity>
             </View>
        </Modal>
  )
}

    getTeamLead=async(query)=>{
      this.setState({ teamLeadName: query });
        var serverurl = url + '/api/HR/userSearch/?username__contains='+query
        var data = await HttpsClient.get(serverurl)
        if(data.type=='success'){
          if(data.data.length>0){
            this.setState({teamList:data.data,show:true})
          }else{
            this.setState({show:false,teamList:[]})
          }
        }else{
          return
        }
    }

    renderClaim=()=>{
     if(this.state.modalShow){
       return(
         <Modal isVisible={this.state.modalShow} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{this.setState({modalShow:false})}} onBackdropPress={()=>{this.setState({modalShow:false})}} >
             <View style={[styles.modalViewUpdate,{overflow:'hidden',}]}>
             <ScrollView>
              <View style={{}}>
                  <Text style={{marginHorizontal:15,marginVertical:10,fontWeight:'700',fontSize:18}}>Install Application</Text>
                  <View style={{}}>
                   <View style={{}}>

                   <View style={{marginHorizontal:15,marginVertical:10}}>
                     <Text style={{color:'#000',fontSize:16,paddingBottom:10,fontWeight:'700'}}>Application</Text>
                     <View style={{flexDirection:'row',}}>
                          <TextInput style={{height: 50,borderWidth:1,borderColor:'#f2f2f2',width:'100%',borderRadius:10,backgroundColor:'#f2f2f2',paddingHorizontal:15,fontSize:16}}
                            placeholder="Application"
                            selectionColor={'#000'}
                            placeholderTextColor='rgba(0, 0, 0, 0.5)'
                            onChangeText={query => { this.searchApp(query)}}

                            value={this.state.applicationName}

                           />
                     </View>
                     {this.state.show&&this.state.searchList.length>0&&
                       <View style={{}}>
                         <View style={{}}>
                           <FlatList contentContainerStyle={{borderWidth:1,borderColor:'#F3F6FB',borderRadius:10,borderTopWidth:0,}}
                           data={this.state.searchList}
                           keyExtractor={(item, index) => index.toString()}
                           renderItem={({item,index})=>{
                           return(
                             <View style={{marginVertical:0,backgroundColor:'#F3F6FB',borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center'}} >
                               <TouchableOpacity onPress={()=>{this.setAppList(item)}}>
                                 <View  style={{}} >
                                   <Text style={{color:'#000',fontSize:16,fontWeight:'600'}} numberOfLines={2}>{item.app.name}
                                   </Text>
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

                 <View style={{flexDirection:'row',marginVertical:10,marginBottom:20,alignItems:'center',justifyContent:'center'}}>
                    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                      <TouchableOpacity onPress={()=>{this.installApplication()}} style={{backgroundColor:'#132E5B',paddingHorizontal:25,paddingVertical:7,borderRadius:10}}>
                        <Text style={{color:'#fff',fontSize:18,}}>Install</Text>
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
  setAppList=(item)=>{
    this.setState({selectedApp:item,applicationName:item.app.name,show:false,searchList:[]})
  }
  searchApp=async(query)=>{
    this.setState({ applicationName: query });
    if(query.length==0){
      this.setState({searchList:[],show:false})
      return
    }
      var serverurl = url + '/api/HR/appInstaller/?search='+query
      var data = await HttpsClient.get(serverurl)
      console.log(data);
      if(data.type=='success'){
        if(data.data.length>0){
          this.setState({searchList:data.data,show:true})
        }else{
          this.setState({show:false,searchList:[]})
        }
      }else{
        return
      }
  }
  installApplication=async()=>{
    if(this.state.selectedApp==null){
      this.toast.show('Select App',2000);
      return
    }
    var sendData = {
      app:this.state.selectedApp.pk,
      designation:this.state.designation,
    }
      var serverurl =url + '/api/HR/appInstaller/'
      var data = await HttpsClient.post(serverurl,sendData)
      console.log(sendData,data,'pkkkkkkk');

    if(data.type=='success'){
      this.setState({modalShow:false})
      this.getDetails()
    }else{
      return
    }
  }
  askDelete = (item)=>{
   Alert.alert(
       'Delete',
       'Are you sure?',
       [
         {text: 'Cancel', onPress: () => {
           return null
         }},
         {text: 'Confirm', onPress: () => {
           this.deleteApplication(item)
         }},
       ],
       { cancelable: false }
     )
 }
  deleteApplication=async(app)=>{
      var serverurl =url + '/api/HR/appInstaller/?app='+app.pk
      var data = await HttpsClient.delete(serverurl)
      console.log(data,'pkkkkkkk');

    if(data.type=='success'){
      this.getDetails()
    }else{
      return
    }

  }
    render(){
        return(
          <View style={{flex:1,backgroundColor:"#fff"}}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#fff'}}>
               <StatusBar   translucent={true} barStyle="dark-content" backgroundColor={'#fff'} networkActivityIndicatorVisible={false}    />
            </View>
            {this.renderHeader()}

            <View style={{flex:1,}}>
               <ScrollView  ref={(view) => {
                  this.scrollView = view;
                }} contentContainerStyle={{paddingBottom:60}}>

              <View style={{}}>
              <FlatList style={{flex:1,borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff', }}
               contentContainerStyle={{paddingRight:15,paddingLeft: 10,paddingTop:5,}}
                    data={this.state.apps}
                    keyExtractor={(item,index) => {
                      return index.toString();
                    }}
                    horizontal={true}
                    nestedScrollEnabled={true}
                    renderItem={({item, index}) =>{

                      if(item.pk==undefined){
                        return (
                          <View style={{paddingVertical: 15,flex:1,backgroundColor:'#fff',height:'100%'}}>
                          <TouchableOpacity onPress={()=>{this.setState({modalShow:true})}}>
                          <View style={{alignItems:'center',justifyContent:'center',paddingHorizontal:5,}}>
                            <Card containerStyle={[{borderWidth: 0, borderColor: '#fff', borderRadius: 20,width:width*0.2,height:width*0.2,margin:0,padding: 0,marginRight:15,marginLeft:5}]}>
                               <View style={{height:'100%'}}>
                                 <View style={{flex:1,}}>
                                   <View style={{position: 'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#000',borderRadius:15,alignItems:'center',justifyContent:'center'}}>
                                     <AntDesign name="plus" size={35} color="#fff" />
                                   </View>
                                 </View>
                               </View>
                            </Card>
                            <Text style={{color:"#000",fontWeight:'600',fontSize:16,paddingVertical:5,textAlign:'center'}}>Install New</Text>
                            </View>
                            </TouchableOpacity>
                          </View>
                        )
                      }else{
                        var image = ''
                        if(item.app.icon!=null&&item.app.icon!=undefined){
                          image = item.app.icon
                        }
                        return (
                          <View style={{paddingVertical: 15,flex:1,backgroundColor:'#fff',height:'100%'}}>
                          <TouchableOpacity onPress={()=>{this.askDelete(item)}}>
                          <View style={{alignItems:'center',justifyContent:'center',paddingHorizontal:5}}>
                            <Card containerStyle={[{borderWidth: 0, borderColor: '#fff', borderRadius: 20,width:width*0.2,height:width*0.2,margin:0,padding: 0,marginRight:15,marginLeft:5}]}>
                               <View style={{height:'100%'}}>
                                 <View style={{flex:1,}}>
                                   <View style={{position: 'absolute',top:0,left:0,right:0,bottom:0,}}>
                                     <Image
                                     source={image.length>0?{uri:this.state.SERVER_URL+image}:null}
                                     style={{ width: '100%', height:'100%',borderRadius: 15,zIndex: 1,resizeMode:'cover'}}
                                     />
                                   </View>
                                   <View style={{position: 'absolute',top:-13,right:-13, width: 26, height:26,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:'#f00',zIndex:99}}>
                                    <AntDesign name="close" size={16} color="#fff" />
                                   </View>
                                 </View>
                               </View>
                            </Card>
                            <Text style={{color:"#000",fontWeight:'600',fontSize:16,paddingVertical:5,textAlign:'center'}}>{item.app.displayName}</Text>
                            </View>
                            </TouchableOpacity>
                          </View>
                        )
                      }
                    }}

                    />
              </View>

              <View style={{}}>

                 <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                  <Text style={{color:"grey",fontWeight:'700',fontSize:16,paddingBottom:10}}>Basic</Text>
                  <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Employee Id</Text>
                  <View style={{flexDirection:'row',}}>
                       <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Employee Id"
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           selectionColor={'#000'}
                           onChangeText={query => { this.setState({ id: query }); }}
                           value={this.state.id}
                        />
                  </View>
                </View>

                <View style={{marginHorizontal:25,marginVertical:10,}}>
                 <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Is Staff?</Text>
                 <View style={{flexDirection:'row',}}>
                     <Switch
                       trackColor={{ false: "#767577", true: "#49cc5b" }}
                       thumbColor={this.state.is_staff ? "#fff" : "#f4f3f4"}
                       ios_backgroundColor="#3e3e3e"
                       onChange={()=>this.setState({is_staff:!this.state.is_staff})}
                       value={this.state.is_staff}
                     />
                 </View>
               </View>

                <View style={{flexDirection:'row',paddingVertical:15,paddingHorizontal:20,}}>
                   <View style={{paddingRight:7,flex:1}}>
                     <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Role</Text>
                      <DropDownPicker
                       items={this.state.roleList}
                       dropDownStyle={{backgroundColor:'#F3F6FB',borderWidth:1,marginTop:2,borderColor:'#F3F6FB'}}
                       defaultValue={this.state.selectedRole!=undefined?this.state.selectedRole.value:null}
                       placeholder="Select Role"
                       arrowColor={'#000'}
                       dropDownMaxHeight={width*0.5}
                       style={{backgroundColor:'#F3F6FB',borderWidth:1,borderColor:'#F3F6FB',borderRadius:15}}
                       placeholderStyle={{fontWeight: 'bold',color:'#000'}}
                       labelStyle={{fontSize: 16, color: '#000',}}
                       containerStyle={{height: 45,width:'100%',borderRadius:15}}
                       onChangeItem={item =>{ this.setState({selectedRole:item})}}
                       />
                   </View>
                </View>



                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>First Name</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="First Name"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({first_name:item})}}
                           value={this.state.first_name}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Last Name</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Last Name"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({last_name:query})}}
                           value={this.state.last_name}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Email</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Email"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({email:query})}}
                           value={this.state.email}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Mobile</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Mobile"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({mobile:query})}}
                           value={this.state.mobile.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{flexDirection:'row',paddingVertical:15,paddingHorizontal:20,}}>
                     <View style={{paddingRight:7,flex:1}}>
                       <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Work Location</Text>
                        <DropDownPicker
                         items={this.state.unitList}
                         dropDownStyle={{backgroundColor:'#F3F6FB',borderWidth:1,marginTop:2,borderColor:'#F3F6FB'}}
                         defaultValue={this.state.selectedUnitList!=undefined?this.state.selectedUnitList.value:null}
                         placeholder="Team Unit"
                         arrowColor={'#000'}
                         dropDownMaxHeight={width*0.5}
                         style={{backgroundColor:'#F3F6FB',borderWidth:1,borderColor:'#F3F6FB',borderRadius:15}}
                         placeholderStyle={{fontWeight: 'bold',color:'#000'}}
                         labelStyle={{fontSize: 16, color: '#000',}}
                         containerStyle={{height: 45,width:'100%',borderRadius:15}}
                         onChangeItem={item =>{ this.setState({selectedUnitList:item})}}
                         />
                     </View>
                  </View>



                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                   <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Activate Payroll</Text>
                   <View style={{flexDirection:'row',}}>
                       <Switch
                         trackColor={{ false: "#767577", true: "#49cc5b" }}
                         thumbColor={this.state.activePayroll ? "#fff" : "#f4f3f4"}
                         ios_backgroundColor="#3e3e3e"
                         onChange={()=>this.setState({activePayroll:!this.state.activePayroll})}
                         value={this.state.activePayroll}
                       />
                   </View>
                 </View>

                 </View>

                 {this.state.activePayroll&&
                  <View style={{}}>
                  <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                   <Text style={{color:"grey",fontWeight:'700',fontSize:16,paddingBottom:10}}>CTC</Text>
                   <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>HRA</Text>
                   <View style={{flexDirection:'row',}}>
                        <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                          placeholder="HRA"
                          selectionColor={'#000'}
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          onChangeText={query => { this.setState({hra:query})}}
                          value={this.state.hra.toString()}
                          keyboardType={'numeric'}
                         />
                   </View>
                  </View>


                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Special Allowance</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Special Allowance"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({specialAllowance:query})}}
                           value={this.state.specialAllowance.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>LTA</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="LTA"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({lta:query})}}
                           value={this.state.lta.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Basic + DA</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Basic + DA"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({basicDA:query})}}
                           value={this.state.basicDA.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Fixed Variable</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Fixed Variable"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({fixedVariable:query})}}
                           value={this.state.fixedVariable.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Statutory Bonus</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Statutory Bonus"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({statutoryBonus:query})}}
                           value={this.state.statutoryBonus.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Company Contribution (PF)</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Company Contribution (PF)"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({companyContribution:query})}}
                           value={this.state.companyContribution.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Employee Contribution (PF)</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Employee Contribution (PF)"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({employeeContribution:query})}}
                           value={this.state.employeeContribution.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Professional Tax</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Professional Tax"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({professionalTax:query})}}
                           value={this.state.professionalTax.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                    <Text style={{color:"grey",fontWeight:'600',fontSize:16,paddingVertical:10}}>Various states apply a 200 INR professional tax on salaried employees, Please check with your CA for more info</Text>
                    <Text style={{color:"#000",fontWeight:'600',fontSize:20,paddingVertical:10}}>Total CTC : {this.state.ctc}</Text>
                  </View>


                </View>
              }

                <View style={{}}>
                  <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                   <Text style={{color:"grey",fontWeight:'700',fontSize:16,paddingBottom:10}}>PF Details</Text>
                   <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>PF Universal Account Number</Text>
                   <View style={{flexDirection:'row',}}>
                        <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                          placeholder="PF Universal Account Number"
                          selectionColor={'#000'}
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          onChangeText={query => { this.setState({universalAccountNo:query})}}
                          value={this.state.universalAccountNo.toString()}
                          keyboardType={'numeric'}
                         />
                   </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>PF Account Number</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="PF Account Number"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({pfAccountNo:query})}}
                           value={this.state.pfAccountNo.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>
                </View>

                <View style={{}}>
                  <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                   <Text style={{color:"grey",fontWeight:'700',fontSize:16,paddingBottom:10}}>Leaves</Text>
                   <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Annual Leaves</Text>
                   <View style={{flexDirection:'row',}}>
                        <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                          placeholder="No of Leaves"
                          selectionColor={'#000'}
                          placeholderTextColor='rgba(0, 0, 0, 0.5)'
                          onChangeText={query => { this.setState({al:query})}}
                          value={this.state.al.toString()}
                          keyboardType={'numeric'}
                         />
                   </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Medical Leaves</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="No of Leaves"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ml:query})}}
                           value={this.state.ml.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>
                </View>



                  {this.renderFooter()}


               </ScrollView>

               <View>

                {this.renderModal()}
                {this.renderClaim()}
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
    renderFooter=()=>{
      return(
        <View style={{height:50,alignItems:'center',justifyContent:'center',marginTop:15}}>
          <TouchableOpacity onPress={()=>{this.save();}} style={{flex:1,justifyContent: 'center', alignItems: 'center',backgroundColor:'#00875F',paddingHorizontal:25,borderRadius:15}}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:18}}>Save</Text>
          </TouchableOpacity>
       </View>
      )
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
       shadowOpacity: 0,
       shadowRadius: 3.84,
       elevation: 3,
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
       marginHorizontal: width*0.05 ,
       borderRadius:5,
    },
    modalView1:{
     backgroundColor: '#fff',
     marginHorizontal: 0 ,
     width:width
    }

   });

  export default EmployeeProfile
