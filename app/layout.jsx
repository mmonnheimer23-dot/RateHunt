import './globals.css';
export const metadata={title:'RateHunt',description:'Personalized auto and home insurance planning estimates for New Mexico.',applicationName:'RateHunt',manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg'},appleWebApp:{capable:true,statusBarStyle:'default',title:'RateHunt'},formatDetection:{telephone:false}};
export const viewport={themeColor:'#082f4f',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Layout({children}){return <html lang="en"><body>{children}</body></html>}
