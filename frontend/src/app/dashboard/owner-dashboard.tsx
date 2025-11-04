type Props = {
  session: Session;
};

const OwnerDashboard = ({ session }: Props) => {
  return <div>Owner dashboard... token: {session.token}</div>;
};

export default OwnerDashboard;
