import cron from 'node-cron';

export function startCronJobs() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running price update cron job...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cron job completed:', data);
      } else {
        console.error('Cron job failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });

  console.log('Cron jobs started - running every hour');
}
