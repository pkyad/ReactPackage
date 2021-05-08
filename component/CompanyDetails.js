import React, { Component }  from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,StatusBar,Vibration,TouchableWithoutFeedback,TextInput,ViewPropTypes
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
const url = settings.url

class CompanyDetails extends React.Component{

  static navigationOptions=({navigation})=>{
    const { params = {} } = navigation.state
    return {header:null}
  };


    constructor(props) {
      super(props);

      this.state = {
         SERVER_URL:'',
         companyName:'',
         website:'',
         pan:'',
         upi:'',
         gstin:'',
         officeAddress:'',
         pincode:'',
         city:'',
         state:'',
         country:'',
         selectedImage:'',
         imageChange:false,
         item:null
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
      this.getMyDivision()
    }

    getMyDivision=async()=>{
      var serverurl = url + '/api/organization/getMyDivision/'
      var data = await HttpsClient.get(serverurl)
      if(data.type=='success'){
        console.log(url+data.data.logo,'hfhfh');
        var list = data.data
        this.setState({item:data.data,companyName:list.name,website:list.website,selectedImage:{uri:url+list.logo},pan:list.pan,upi:list.upi,gstin:list.cin,})
      }else{
        return
      }
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
     this.setState({selectedImage:photo,imageChange:true})
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
      this.setState({selectedImage:photo,imageChange:true})
};


    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
           <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
            <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
           </TouchableOpacity>
           <View style={{width:width*0.7,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#252525',fontSize:20,fontWeight:'700'}}>Company Details</Text>
           </View>
          <View style={{width:width*0.15}} />
       </View>
      )
    }


    setProductMeta=(item)=>{
      this.setState({productMeta:item,taxCode:item.code,taxRate:item.taxRate,show:false,productMetaList:[]})
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
                        style={{marginRight:5,color:'#132E5B',
                                textAlign: 'center'}} />
                        <Text   style={{fontSize:16,color:'#132E5B',textAlign:'center'}}>Gallary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.modalAttach('camera')}} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                    <FontAwesome
                        name="camera"
                        size={width*0.14}
                        style={{color:'#132E5B',textAlign: 'center',}}
                        />
                    <Text   style={{fontSize:16,color:'#132E5B',textAlign:'center',}}>camera</Text>
                  </TouchableOpacity>
             </View>
        </Modal>
  )
}

save=async(item,index)=>{

  var sendData = {
    cin:this.state.gstin,
    name:this.state.companyName,
    pan:this.state.pan,
    upi:this.state.upi,
    website:this.state.website,
    bodyType:'formData'
  }
  if(this.state.imageChange==true){
    sendData.logo = this.state.selectedImage
  }
  var serverurl = url + '/api/organization/divisions/'+this.state.item.pk+'/'
  var data = await HttpsClient.patch(serverurl,sendData)

  console.log(sendData,'dfbsbn',data,serverurl,item);
  if(data.type=='success'){
    this.props.navigation.goBack()
    this.getMyDivision()
  }else{
    return
  }

}

    getProductMeta=async(query)=>{
      this.setState({ taxCode: query });
        var serverurl = url + '/api/ERP/productMeta/?search='+query
        var data = await HttpsClient.get(serverurl)
        console.log(data);
        if(data.type=='success'){
          if(data.data.length>0){
            this.setState({productMetaList:data.data,show:true})
          }else{
            this.setState({show:false,productMetaList:[]})
          }
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

                <View style={{marginHorizontal:25,marginVertical:10}}>
                  <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Your Logo</Text>
                  <View style={{flexDirection:'row'}}>
                      <TouchableOpacity onPress={()=>{this.attachShow()}} style={{width:width*0.2,height:width*0.2,borderRadius:width*0.1,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                      <Image source={{uri:this.state.selectedImage.uri}} style={{width:width*0.2,height:width*0.2,borderRadius:width*0.1}} />
                    </TouchableOpacity>
                  </View>
                </View>

                 <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                  <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Company Name</Text>
                  <View style={{flexDirection:'row',}}>
                       <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Company Name"
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           selectionColor={'#000'}
                           onChangeText={query => { this.setState({ companyName: query }); }}
                           value={this.state.companyName}
                        />
                  </View>
                </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Website</Text>
                    <View style={{flexDirection:'row',}}>

                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Website"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ website: query }); }}
                           value={this.state.website.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>PAN</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="PAN"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ pan: query }); }}
                           value={this.state.pan.toString()}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>UPI</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="UPI"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ upi: query }); }}
                           value={this.state.upi}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>GSTIN</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="GSTIN"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({gstin:query})  }}
                           value={this.state.gstin}
                          />
                    </View>
                  </View>

                  {this.renderFooter()}


               </ScrollView>

               <View>
                {this.renderModal()}
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
          <TouchableOpacity onPress={()=>{this.save();}} style={{flex:1,justifyContent: 'center', alignItems: 'center',backgroundColor:'#132E5B',paddingHorizontal:25,borderRadius:15}}>
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
       shadowOpacity: 0.25,
       shadowRadius: 3.84,
       elevation: 0,
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
       marginHorizontal: width*0.05 ,
       borderRadius:5,
    },
    modalView1:{
     backgroundColor: '#fff',
     marginHorizontal: 0 ,
     width:width
    }

   });

  export default CompanyDetails
