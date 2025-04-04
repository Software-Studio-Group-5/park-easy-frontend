'use client';
import React from "react";
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import Image from 'next/image';
import Registration from "@/app/components/Registration";

const Signup: React.FC = () => {
  return (
    <div id="home" className="flex justify-center align-center">
      <Card variant="outlined" color="primary" sx={{ minWidth: 275, minHeight: 200, padding: 2 }}>
        <CardContent>
          <Image src="/logo.jpg" alt="Logo" width={50} height={50} />
          <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 20, textAlign: "justify" }}>ParkEasy</Typography>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 20, textAlign: "justify" }}>Sign Up</Typography>
          <Registration />
          <Typography sx={{ color: 'text.secondary', fontSize: 12, textAlign: "justify" }} ><a href="/login">Already have an account?</a> <Link href="/signin">Log In!</Link></Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
