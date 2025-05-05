import React from 'react';
import DashboardFeature from '../components/dashboard/DashboardFeature';
import Layout from '~~/components/layout/Layout';
import NetworkSupportChecker from '../../components/NetworkSupportChecker';

/**
 * A simple page dedicated to displaying the DashboardFeature component.
 */
function DashboardPage() {
    return (
        <Layout>
            <NetworkSupportChecker><></></NetworkSupportChecker>
            {/* Render the existing Dashboard feature */}
            <DashboardFeature />
        </Layout>
    );
}

export default DashboardPage; 