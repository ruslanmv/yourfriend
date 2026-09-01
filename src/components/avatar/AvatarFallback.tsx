export function AvatarFallback() {
  return <div className="avatar-fallback" aria-label="YourFriend companion preview" role="img">
    <div className="avatar-fallback__halo"/>
    <div className="avatar-fallback__figure">
      <div className="avatar-fallback__hair"/>
      <div className="avatar-fallback__face"><span/><span/><i/></div>
      <div className="avatar-fallback__neck"/>
      <div className="avatar-fallback__body"/>
      <div className="avatar-fallback__arm"/>
    </div>
  </div>;
}
