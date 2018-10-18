import React,{Component} from 'react'
import { Checkbox, Row, Col,Select ,Menu ,Button, Input,Tooltip } from 'antd';
import emitter from '../components/Emitter.js'
import $Ajax from '../utils/ajax.js'
const Option = Select.Option;
const SubMenu = Menu.SubMenu;

class Sider extends React.Component {
    // submenu keys of first level
    rootSubmenuKeys = ['sub1', 'sub2'];
    sourceData=[
        {"keywords":[
                {"keywordName":"start ADH",
                "args":[
                    {"argName":"ADH",
                     "desc":"set ADH which going to startup",
                     "type":"string",
                     "possibleValue":["ADH1","ADH2"]
                    },
                    {"argName":"wait",
                     "desc":"seconds to to wait ADH startup",
                     "type":"int"}
                  ]},
                  {"keywordName":"start ADS",
                  "args":[
                      {"argName":"ADS",
                      "desc":"set ADS which going to startup",
                      "type":"string","possibleValue":["ADS1","ADS2"]
                      },
                      {"argName":"wait",
                       "desc":"seconds to to wait ADS startup",
                       "type":"int"}
                      ]}
                  ],
        "catalogName":"Start"},
        {"keywords":
            [
                {"keywordName":"stop ADH",
                "args":[{"argName":"ADH","desc":"set ADH which going to stop","type":"string","possibleValue":["ADH1","ADH2"]},{"argName":"wait","desc":"seconds to to wait ADH stop","type":"int"}]},{"keywordName":"stop ADS","args":[{"argName":"ADS","desc":"set ADS which going to stopup","type":"string","possibleValue":["ADS1","ADS2"]},{"argName":"wait","desc":"seconds to to wait ADS stopup","type":"int"}]}],
        "catalogName":"Stop"}];
    
    state = {
      openKeys: ['sub1'],
      getKeywordsInfo:this.sourceData
    };
    componentDidMount(){
        this.getKeywordsInfo()
    }
    async getKeywordsInfo (){
        let TOKEM=sessionStorage.getItem("TOKEN");
        let f2=await $Ajax("getKeywordsInfo?token="+TOKEM,"POST");
        this.setState({
          getKeywordsInfo:f2
        })
    }
    onOpenChange = (openKeys) => {
      console.log(openKeys)
      const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.setState({ openKeys });
      } else {
        this.setState({
          openKeys: latestOpenKey ? [latestOpenKey] : [],
        });
      }
    }
    pick=(v)=>{
        emitter.emit('pick',v)
    }
    render() {
      return (
        <Menu
          mode="inline"
          openKeys={this.state.openKeys}
          onOpenChange={this.onOpenChange}
          style={{ width: 256 }}
        >
        {this.state.getKeywordsInfo.map((item,i)=>
            <SubMenu key={"sub"+(i+1)} title={<span><span>{item.catalogName}</span></span>}>
                {item.keywords.map((itemj,j)=>
                    <SubMenu key={"sub"+(this.state.getKeywordsInfo.length+5+j)} title={itemj.keywordName}>
                         {itemj.args.map((iteml,l)=>
                        //  onClick={this.pick.bind(this,item)}
                                    <Menu.Item onClick={this.pick.bind(this,iteml)}   key={"sub"+(this.state.getKeywordsInfo.length+10+l)}>{iteml.argName}</Menu.Item>
                            )}
                    </SubMenu>
                )}
            </SubMenu>
        )}
        </Menu>
      );
    }
  }

class ServerConfig extends Component{
    constructor(){
        super()
        this.state={
            Features:null,
            config:null,
            select:null,
            selKey:[],
            selVal:[],
            inpvalues:[],
            DelIndex:[]
        }
        this.textInput = React.createRef();
        this.text =(txt)=>{
            return <span>{txt}</span>;
        } 
            
    }
    
    changeInp=(i,v,event)=>{
        const Option = Select.Option;
        let inpvalues=this.state.inpvalues;
        let selVal=this.state.selVal;
        if(typeof(event)==="string"){
            //说明是下拉框
            inpvalues[i]=event;
            selVal[i]=(<Tooltip placement="left" title={this.text(v.desc)}>
            <Select value={this.state.inpvalues[i]} onChange={this.changeInp.bind(this,i,v)}  style={{ width: 120 }} >
                {v.possibleValue.map((item,i)=>
                        <Option key={i} value={item}>{item}</Option>
                )}
            </Select></Tooltip>);
        }else{
            inpvalues[i]=event.target.value;
            selVal[i]=<Input placeholder={v.desc} value={this.state.inpvalues[i]} onChange={this.changeInp.bind(this,i,v)}/>
        }
        this.setState({
            inpvalues:inpvalues,
            selVal:selVal
        })
    }
    componentDidMount(){
        const Option = Select.Option;
        let count=-1;
        emitter.on('pick', (v) =>{
            
            let selKey=this.state.selKey;
            let selVal=this.state.selVal;
            count++;
            selKey.push(v.argName);
            if(v.possibleValue){
                let inpvalues=this.state.inpvalues;
                inpvalues[count]="";
                this.setState({
                    inpvalues:inpvalues
                })
                selVal.push(<Tooltip placement="left" title={this.text(v.desc)}><Select value={this.state.inpvalues[count]} onChange={this.changeInp.bind(this,count,v)}  style={{ width: 120 }} >
                    {v.possibleValue.map((item,i)=>
                          <Option key={i} value={item}>{item}</Option>
                    )}
                </Select></Tooltip>)
            }else{
                let inpvalues=this.state.inpvalues;
                inpvalues[count]="";
                this.setState({
                    inpvalues:inpvalues
                })
                selVal.push(<Input placeholder={v.desc} value={this.state.inpvalues[count]} onChange={this.changeInp.bind(this,count,v)}/>)
            }       
            this.setState({
                selKey:selKey,
                selVal:selVal
            })
        })
    }
    toTop(k){
        if(k===0){return}
        let selKey=this.state.selKey;
        let selVal=this.state.selVal;
        let inpvalues=this.state.inpvalues;
        let selKey1=selKey[k-1];
        let selKey2=selKey[k];
        let inpvalues1=inpvalues[k-1];
        let inpvalues2=inpvalues[k];

        selKey.splice(k-1,2,selKey2,selKey1);
        inpvalues.splice(k-1,2,inpvalues2,inpvalues1);
        this.setState({
            selKey:selKey,
            inpvalues:inpvalues,
        })

        let selVal1=selVal[k-1];
        let v={possibleValue:[],desc:''};
        if(selVal1.props.children){
            selVal1.props.children.props.children.forEach((item)=>{
                v.possibleValue.push(item.props.value)
            })
            v.desc=selVal1.props.title.props.children;
        }else{
            v.desc=selVal1.props.placeholder
        }
        selVal1.props.prefixCls==="ant-input"?
        selVal1=<Input  placeholder={v.desc} value={this.state.inpvalues[k]} onChange={this.changeInp.bind(this,k,v)}/>
        :
        selVal1=<Tooltip placement="left" title={this.text(v.desc)}><Select value={this.state.inpvalues[k]} onChange={this.changeInp.bind(this,k,v)}  style={{ width: 120 }} >
            {selVal[k-1].props.children.props.children.map(item=>
                    <Option value={item.props.value}>{item.props.value}</Option>
             )}
        </Select></Tooltip>;
        let selVal2=selVal[k];
        if(selVal2.props.children){
            selVal2.props.children.props.children.forEach((item)=>{
                v.possibleValue.push(item.props.value)
            })
            v.desc=selVal2.props.title.props.children;
        }else{
            v.desc=selVal2.props.placeholder
        }
        selVal2.props.prefixCls==="ant-input"?
        selVal2=<Input  placeholder={v.desc} value={this.state.inpvalues[k-1]} onChange={this.changeInp.bind(this,k-1,v)}/>
        :selVal2=<Tooltip placement="left" title={this.text(v.desc)}><Select value={this.state.inpvalues[k-1]} onChange={this.changeInp.bind(this,k-1,v)}  style={{ width: 120 }} >
            {selVal[k].props.children.props.children.map(item=>
                    <Option value={item.props.value}>{item.props.value}</Option>
             )}
        </Select></Tooltip>;
        selVal.splice(k-1,2,selVal2,selVal1);
        this.setState({
            selVal:selVal,
        })
    }
    toDown(k){
        let selKey=this.state.selKey;
        let selVal=this.state.selVal;
        let inpvalues=this.state.inpvalues;
        let DelIndex=this.state.DelIndex;
        if(k>=selKey.length-1){
            return
        }
        if(selVal.length-1-DelIndex===k){
            return
        }
        let selKey1=selKey[k+1];
        let selKey2=selKey[k];

        let inpvalues1=inpvalues[k+1];
        let inpvalues2=inpvalues[k];

        selKey.splice(k,2,selKey1,selKey2);
        inpvalues.splice(k,2,inpvalues1,inpvalues2);
        this.setState({
            selKey:selKey,
            inpvalues:inpvalues,
        })

        let selVal1=selVal[k+1];
        let v={possibleValue:[],desc:''};
        if(selVal1.props.children){
            selVal1.props.children.props.children.forEach((item)=>{
                v.possibleValue.push(item.props.value)
            })
            v.desc=selVal1.props.title.props.children;
        }else{
            v.desc=selVal1.props.placeholder
        }
        selVal1.props.prefixCls==="ant-input"?
        selVal1=<Input  placeholder={v.desc} value={this.state.inpvalues[k]} onChange={this.changeInp.bind(this,k,v)}/>
        :
        selVal1=<Tooltip placement="left" title={this.text(v.desc)}><Select value={this.state.inpvalues[k]} onChange={this.changeInp.bind(this,k,v)}  style={{ width: 120 }} >
            {selVal[k+1].props.children.props.children.map(item=>
                    <Option value={item.props.value}>{item.props.value}</Option>
             )}
        </Select></Tooltip>;
        let selVal2=selVal[k];
        v={possibleValue:[],desc:''};
        if(selVal2.props.children){
            selVal2.props.children.props.children.forEach((item)=>{
                v.possibleValue.push(item.props.value)
            })
            v.desc=selVal2.props.title.props.children;
        }else{
            v.desc=selVal2.props.placeholder
        }
        selVal2.props.prefixCls==="ant-input"?
        selVal2=<Input  placeholder={v.desc} value={this.state.inpvalues[k+1]} onChange={this.changeInp.bind(this,k+1,v)}/>
        :selVal2=<Tooltip placement="left" title={this.text(v.desc)}><Select value={this.state.inpvalues[k+1]} onChange={this.changeInp.bind(this,k+1,v)}  style={{ width: 120 }} >
            {selVal[k].props.children.props.children.map(item=>
                    <Option value={item.props.value}>{item.props.value}</Option>
             )}
        </Select></Tooltip>;
        selVal.splice(k,2,selVal1,selVal2);
        this.setState({
            selVal:selVal
        })
    }
    toDel(k){
        let DelIndex=this.state.DelIndex;
        DelIndex++;
        
        for(let i=k;i>0;i--){
            this.toTop(i)
        }
        for(let i=0;i<DelIndex;i++){
            this.textInput.current.children[i].style.border ="1px solid #0ff";
            this.textInput.current.children[i].style.display ='none';
        }
        this.textInput.current.children[DelIndex].children[0].children[0].style.visibility ='hidden';
        this.setState({
            DelIndex:DelIndex
        })
    }
    render(){
        let that=this;
        function onChange(checkedValues) {
            that.setState({
                config:checkedValues
            })
            console.log('checked = ', checkedValues);
        }
        function _Checkbox(checkedValues) {
            that.setState({
                Features:checkedValues
            })
            console.log('checked = Features', checkedValues);
        }
        const Option = Select.Option;
        function handleChange(value) {
            that.setState({
                select:value
            })
            console.log(`selected ${value}`);
        }
        return(
            <ul className="App-serverConfig">
                <li>
                    <span>1.config:</span>
                    <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
                        <Row>
                        <Col span={8}><Checkbox value="stand-alone">stand-alone</Checkbox></Col>
                        <Col span={8}><Checkbox value="load-balance">load-balance</Checkbox></Col>
                        <Col span={8}><Checkbox value="host-study">host-study</Checkbox></Col>
                        </Row>
                    </Checkbox.Group>
                </li>
                <li>
                    <span>2.Features:</span>
                    <Checkbox.Group style={{ width: '100%' }} onChange={_Checkbox}>
                        <Row>
                        <Col span={8}><Checkbox value="Delay">Delay</Checkbox></Col>
                        <Col span={8}><Checkbox value="Mceos">Mceos</Checkbox></Col>
                        <Col span={8}><Checkbox value="Medel">Medel</Checkbox></Col>
                        </Row>
                    </Checkbox.Group>
                </li>
                <li>
                    <span>3.license:</span>
                    <Select defaultValue="lucy"  style={{ width: 120 }} onChange={handleChange}>
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                        <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                </li>
                <li>
                    <span>4.step:</span>
                    <div style={{display:'flex'}}>
                        <Sider />
                        <ul className="step_right" ref={this.textInput}>
                            {this.state.selKey.map((item,i)=>{
                                return (<li key={i}>
                                 <span>
                                    <Button onClick={this.toTop.bind(this,i)} type="primary" icon="up-square"></Button>
                                    <Button onClick={this.toDown.bind(this,i)}  type="primary" icon="down-square"></Button>
                                    <Button onClick={this.toDel.bind(this,i)}  type="primary" icon="minus-circle"></Button>
                                    {item}
                                 </span>
                                 {this.state.selVal[i]}
                                </li>)
                            })}
                        </ul>
                    </div>
                    
                </li>
            </ul>
        )
    }
}
export default ServerConfig