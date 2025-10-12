import HomepageHeader from "../components/HomepageHeader";
import HomePagesidebar from "../components/HomePagesidebar";
import HomepageBody from "../components/HomepageBody";

const HomePage = () => {
  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      <HomepageHeader />
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '12px 18px' }}>
        <div style={{ flex: '0 0 220px' }}>
          <HomePagesidebar />
        </div>

        <div style={{ flex: 1 }}>
          <HomepageBody />
        </div>
      </div>
    </div>
  );
};

export default HomePage;