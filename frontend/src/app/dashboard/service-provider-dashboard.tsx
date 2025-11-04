type Props = {
  session: Session;
};

const ServiceProviderDashboard = ({ session }: Props) => {
  return <div>Service provider dashboard... token: {session.token}</div>;
};

export default ServiceProviderDashboard;
