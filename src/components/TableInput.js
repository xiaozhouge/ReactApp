import React, { Component } from 'react';
import { Select ,Icon } from 'antd';
const Option = Select.Option;
class TableInput extends Component{
    handleChange=(itemj,i,e)=>{
      this.props.data[i][itemj]=e.target.value;
    }
    render(){
      const TableListTitle=()=>{
        const TableTitle=this.props.title.map((item,i)=>
          <th key={i}>{item}</th>
        )
        return (
          <thead>
            <tr>
              {TableTitle}
            </tr>
          </thead>
        )
      }
      const TableListInput=()=>{
          const TableInput=this.props.data.map((item,i) =>{
                const inputs=Object.keys(item).map((itemj,j)=>{
                  if(itemj==="Role"){
                    return item.Role==="ADH"?
                    <td key={j} onClick={this.props._showEdit.bind(this,i)}>{item[itemj]}<Icon type="double-right" /></td>
                      :<td key={j}>{item[itemj]}</td>
                  }else if(itemj==="TransportProtocol"){
                    return <td key={j}>
                                <Select className="dragSelectCast" defaultValue="MultiCast" style={{ width: 120 }}>
                                  {/* <Option key="0" value="BroadCast">BroadCast</Option> */}
                                  <Option key="0" value="MultiCast">MultiCast</Option>
                                </Select>
                            </td>
                  }else if(itemj==="RRCPMode"){
                    return <td key={j}>
                                <Select className="dragSelectRRCP" value={item[itemj]} style={{ width: 120 }} onChange={this.props._changeRRCP.bind(this,itemj,i)}>
                                  <Option key="0" value="RRCP">RRCP</Option>
                                  <Option key="1" value="RRCPDL">RRCPDL</Option>
                                </Select>
                            </td>
                   }else if(itemj==="RsslPort"){
                      return item.Role==="ADS"?
                      <td key={j}><input className="inputTable" defaultValue={item[itemj]} onBlur={this.props._collectData}/></td>
                      :<td key={j}><input disabled className="inputTable" defaultValue="" onBlur={this.props._collectData}/></td>
                   }else if(itemj==="NodeId"){
                     return item.RRCPMode==="RRCP"?
                     <td key={j}><input className="inputTable" defaultValue={item[itemj]} onBlur={this.props._collectData}/></td>
                     :<td key={j}><input disabled className="inputTable" defaultValue="" onBlur={this.props._collectData}/></td>
                   }
                  return(
                    <td key={j}><input className="inputTable" defaultValue={item[itemj]} onBlur={this.props._collectData}/></td>
                  )
                })
                return (
                  <tr  key={i} >
                    {inputs}
                  </tr>
                )
          })
          return (
            <tbody ref={this.props.textRef}>
              {TableInput}
            </tbody>
          )
      }
      return(
        <table  border="1">
          <TableListTitle/>
          <TableListInput />
        </table>
      )
    }
  }

  export default TableInput;