// // frontend/app/(driver)/driver/inbox/[rideId]/page.tsx
// // ... other imports
// import ChatWindow from '@/components/chat/ChatWindow'; // Use your primary chat component

// // ... (getRideDetails, generateMetadata, etc.)

// const RideChatPage = async ({ params }: RideChatPageProps) => {
//   // ... (currentUser, rideDetails fetching and checks)

//   return (
//     <div className="container mx-auto flex flex-col py-6" style={{ height: 'calc(100vh - 80px)' }}> {/* Adjust 80px based on your layout's header/footer */}
//       <header className="mb-4">
//         <h1 className="text-2xl font-semibold">Chat for Ride to: {rideDetails.destination}</h1>
//         <p className="text-sm text-muted-foreground">
//           Departure: {new Date(rideDetails.departureTime).toLocaleString()}
//         </p>
//       </header>
//       {/* Pass rideId directly. ChatWindow will use AuthContext for user/token */}
//       <ChatWindow rideId={rideId} />
//     </div>
//   );
// };
// export default RideChatPage;