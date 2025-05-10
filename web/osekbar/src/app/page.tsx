import { redirect } from 'next/navigation';

export default function Home() {
    // Redirect to the feed page
    // This will be the landing page of the application
    // and will redirect the user to the feed page
    // if they are logged in
  redirect("/feed");
}
