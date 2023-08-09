import { ReactDOM, Component } from '../which-react'
import './index.css'

function FunctionComponent (props) {
  return (
    <div className='border'>
      <p>{props.name}</p>
    </div>
  )
}
class ClassComponent extends Component {
  render () {
    return (
      <div className='border'>
        <h3>{this.props.name}</h3>
        我是文本
      </div>
    )
  }
}
function FragmentComponent () {
  return (
    <ul>
      <>
        <li>li1</li>
        <li>li2</li>
      </>
    </ul>
  )
}
const jsx = (
  <div className='border'>
    <h1>react</h1>
    <a href='https://www.baidu.com'>react2</a>
    <FunctionComponent name='函数组件' />
    <ClassComponent name='类组件' />
    <FragmentComponent />
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(jsx)
