import { useGetApplicationsQuery } from '@app/redux/api';

const Aplications = () => {
  const { data } = useGetApplicationsQuery();

  console.log('Applications Data:', data); // TEMP: Check structure in dev tools
  return <div>Aplications</div>;
};

export default Aplications;
