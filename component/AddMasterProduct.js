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

class CreateProduct extends React.Component{

  static navigationOptions=({navigation})=>{
    const { params = {} } = navigation.state
    return {header:null}
  };


    constructor(props) {
      super(props);
      var item = props.navigation.getParam('item',null)
      var category = props.navigation.getParam('category',null)
      var productName=''
      var mrpPrice=0
      var buyingPrice=0
      var sellingPrice=0
      var productSku=''
      var taxCode=''
      var taxRate=''
      var description=''
      var productMeta=null
      var productMetaList=[]
      var img1=null
      var img2=null
      var img3=null
      if(item!=null){
        productName=item.name
        mrpPrice=item.mrp
        buyingPrice=item.buyingPrice
        sellingPrice=item.rate
        productSku=item.sku
        taxCode=item.taxCode
        taxRate=item.taxRate
        description=item.richtxtDesc
        img1=item.img1!=null?{uri:item.img1}:null
        img2=item.img2!=null?{uri:item.img2}:null
        img3=item.img3!=null?{uri:item.img3}:null
      }
      this.state = {
         SERVER_URL:'',
         productName:productName,
         mrpPrice:mrpPrice,
         buyingPrice:buyingPrice,
         sellingPrice:sellingPrice,
         productSku:productSku,
         taxCode:taxCode,
         taxRate:taxRate,
         description:description,
         productMeta:null,
         productMetaList:[],
         img1:img1,
         img2:img2,
         img3:img3,
         selectedImage:null,
         openImageModal:false,
         edit:false,
         show:false,
         category:category,
         editItem:item
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
        console.log(photo,'1');
        this.setState({img1:photo})
      }else if(this.state.selectedImage=='image2'){
        console.log(photo,'2');
        this.setState({img2:photo})
      }else{
        console.log(photo,'3');
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
            <Text style={{color:'#252525',fontSize:20,fontWeight:'700'}}>{this.state.editItem!=null?'Edit':'Add'} Master Product</Text>
           </View>
          <View style={{width:width*0.15}} />
       </View>
      )
    }

    save=async()=>{

      if(this.state.productName.length==0){
        this.toast.show('Enter Product Name',2000);
        return
      }

      if(this.state.productSku.length==0){
        this.toast.show('Enter Product SKU',2000);
        return
      }
      if(this.state.taxCode.length==0){
        this.toast.show('Enter Tax Code',2000);
        return
      }

      var sendData = {
        name:this.state.productName,
        rate:this.state.sellingPrice,
        buyingPrice:this.state.buyingPrice,
        mrp:this.state.mrpPrice,
        sku:this.state.productSku,
        taxRate:this.state.taxRate,
        taxCode:this.state.taxCode,
        richtxtDesc:this.state.description,
        bodyType:'formData'
      }
      if(this.state.img1!=null&&this.state.img1.name!=undefined){
        sendData.img1 = this.state.img1
      }
      if(this.state.img2!=null&&this.state.img2.name!=undefined){
        sendData.img2 = this.state.img2
      }
      if(this.state.img3!=null&&this.state.img3.name!=undefined){
        sendData.img3 = this.state.img3
      }

      if(this.state.editItem!=null){
        var serverurl =url + '/api/finance/inventory/'+this.state.editItem.pk+'/'
        var data = await HttpsClient.patch(serverurl,sendData)
      }else{
        var serverurl =url + '/api/finance/inventory/'
        var data = await HttpsClient.post(serverurl,sendData)
      }
      // return



      console.log(sendData,'dfbsbn',data,serverurl);
      if(data.type=='success'){
        this.props.navigation.goBack()
      }else{
        return
      }

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

                 <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                  <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Product</Text>
                  <View style={{flexDirection:'row',}}>
                       <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Product Name"
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           selectionColor={'#000'}
                           onChangeText={query => { this.setState({ productName: query }); }}
                           value={this.state.productName}
                        />
                  </View>
                </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>MRP</Text>
                    <View style={{flexDirection:'row',}}>

                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="MRP"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ mrpPrice: query }); }}
                           value={this.state.mrpPrice.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Buying Price</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Buying Price"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ buyingPrice: query }); }}
                           value={this.state.buyingPrice.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Selling Price</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Selling Price"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ sellingPrice: query }); }}
                           value={this.state.sellingPrice.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Product SKU</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Product SKU"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({productSku:query})  }}
                           value={this.state.productSku}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Tax Code</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Tax Code"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.getProductMeta(query)  }}
                           value={this.state.taxCode.toString()}
                          />
                    </View>

                    <View style={{flexDirection:'row',marginTop:5}}>
                      <View style={{flex:1}} >
                        {this.state.show&&this.state.productMetaList.length>0&&
                          <View style={{}}>
                            <View style={{}}>
                              <FlatList contentContainerStyle={{borderWidth:1,borderColor:'#F3F6FB',borderRadius:10,borderTopWidth:0,}}
                              data={this.state.productMetaList}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item,index})=>{
                              return(
                                <View style={{marginVertical:0,backgroundColor:'#F3F6FB',borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center'}} >
                                  <TouchableOpacity onPress={()=>{this.setProductMeta(item)}}>
                                    <View  style={{}} >
                                      <Text style={{color:'#000',fontSize:16,fontWeight:'600'}} numberOfLines={2}>{item.code} : {item.description}</Text>
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

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Tax Rate</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Selling Price"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ taxRate: query }); }}
                           value={this.state.taxRate.toString()}
                           keyboardType={'numeric'}
                          />
                    </View>
                  </View>



                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Description</Text>
                    <View style={{flexDirection:'row'}}>
                         <TextInput style={{height: 110,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16,textAlignVertical:'top',paddingVertical:5}}
                           placeholder="Description"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.setState({ description: query }); }}
                           value={this.state.description}
                           multiline={true}
                          />
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Image1</Text>
                    <View style={{flexDirection:'row'}}>
                      {this.state.img1!=null&&
                        <TouchableOpacity onPress={()=>{this.removeAttachment('image1')}} style={{width:width*0.2,height:width*0.2,borderRadius:10,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                        <Image source={{uri:this.state.img1.uri}} style={{width:width*0.2,height:width*0.2,borderRadius:10}} />
                        <View style={{position: 'absolute',top:-5,right:-10,width:20,height:20,backgroundColor: '#f00',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                        <FontAwesome  name="close" size={15} color="#fff" />
                      </View>
                      </TouchableOpacity>
                    }
                    {this.state.img1==null&&
                      <TouchableOpacity onPress={()=>{this.setState({selectedImage:'image1'});this.attachShow()}} style={{width:width*0.2,height:width*0.2,borderRadius:10,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                        <AntDesign name="plus" size={24} color="black" />
                      </TouchableOpacity>
                    }

                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Image2</Text>
                    <View style={{flexDirection:'row'}}>
                    {this.state.img2!=null&&
                      <TouchableOpacity onPress={()=>{this.removeAttachment('image2')}} style={{width:width*0.2,height:width*0.2,borderRadius:10,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                        <Image source={{uri:this.state.img2.uri}} style={{width:width*0.2,height:width*0.2,borderRadius:10}} />
                        <View style={{position: 'absolute',top:-5,right:-10,width:20,height:20,backgroundColor: '#f00',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                        <FontAwesome  name="close" size={15} color="#fff" />
                      </View>
                      </TouchableOpacity>
                    }
                    {this.state.img2==null&&
                      <TouchableOpacity onPress={()=>{this.setState({selectedImage:'image2'});this.attachShow()}} style={{width:width*0.2,height:width*0.2,borderRadius:10,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                        <AntDesign name="plus" size={24} color="black" />
                      </TouchableOpacity>
                    }
                    </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Image3</Text>
                    <View style={{flexDirection:'row'}}>
                      {this.state.img3!=null&&
                        <TouchableOpacity onPress={()=>{this.removeAttachment('image3')}} style={{width:width*0.2,height:width*0.2,borderRadius:10,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                        <Image source={{uri:this.state.img3.uri}} style={{width:width*0.2,height:width*0.2,borderRadius:10}} />
                        <View style={{position: 'absolute',top:-5,right:-10,width:20,height:20,backgroundColor: '#f00',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                        <FontAwesome  name="close" size={15} color="#fff" />
                      </View>
                      </TouchableOpacity>
                    }
                      {this.state.img3==null&&
                        <TouchableOpacity onPress={()=>{this.setState({selectedImage:'image3'});this.attachShow()}} style={{width:width*0.2,height:width*0.2,borderRadius:10,backgroundColor:'#F3F6FB',alignItems:'center',justifyContent:'center'}}>
                          <AntDesign name="plus" size={24} color="black" />
                        </TouchableOpacity>
                      }
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
        <View style={{height:50,alignItems:'center',justifyContent:'center'}}>
          <TouchableOpacity onPress={()=>{this.save();}} style={{flex:1,justifyContent: 'center', alignItems: 'center',backgroundColor:'#132E5B',paddingHorizontal:25,borderRadius:15}}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:18}}>{this.state.editItem==null?'Save':'Update'}</Text>
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

  export default CreateProduct
