import { FC } from 'react'
// import GreetingForm from '~~/dapp/components/GreetingForm' // Commented out
import Layout from '~~/components/layout/Layout'
import NetworkSupportChecker from '../../components/NetworkSupportChecker'
import DashboardFeature from '~~/dapp/components/DashboardFeature' // <-- 添加这个导入

const IndexPage: FC = () => {
  return (
    <Layout>
      <NetworkSupportChecker />
      <div className="flex flex-grow flex-col items-center justify-center rounded-md p-3">
        {/* <GreetingForm /> // Commented out */}
        <DashboardFeature /> {/* <-- 添加这个组件渲染 */}
      </div>
    </Layout>
  )
}

export default IndexPage