import { ReactDOM, Component, useReducer, useState } from '../which-react'
import './index.css'

function FunctionComponent (props) {
  const [count, setCount] = useReducer(x => x + 1, 0)
  const [count2, setCount2] = useState(0)

  return (
    <div className='border'>
      <p>{props.name}</p>
      <button onClick={() => setCount()}>{count}</button>
      <button
        onClick={() => {
          setCount2(count2 + 1)
        }}
      >
        {count2}
      </button>

      {count % 2 ? <div>omg</div> : <span>123</span>}

      <ul>
        {/* {count2 === 2
          ? [0, 1, 3, 4].map((item) => {
              return <li key={item}>{item}</li>;
            })
          : [0, 1, 2, 3, 4].map((item) => {
              return <li key={item}>{item}</li>;
            })} */}

        {count2 === 2
          ? [2, 1, 3, 4].map(item => {
              return <li key={item}>{item}</li>
            })
          : [0, 1, 2, 3, 4].map(item => {
              return <li key={item}>{item}</li>
            })}
      </ul>
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
    {/* <ClassComponent name='类组件' />
    <FragmentComponent /> */}
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(jsx)
