import { NextRequest, NextResponse } from 'next/server';

interface RetroPGFProject {
  id: string;
  name: string;
  description: string;
  category: 'DeFi' | 'Infrastructure' | 'Tooling' | 'Education' | 'Community' | 'Governance' | 'Developer Tools';
  website: string;
  github?: string;
  twitter?: string;
  fundingReceived: string;
  roundsParticipated: number[];
  impactMetrics: {
    usersServed: number;
    transactionsEnabled: number;
    protocolsSupported: number;
    developersHelped: number;
  };
  badges: string[];
  lastUpdated: string;
}

interface RetroPGFRound {
  round: number;
  name: string;
  status: 'completed' | 'active' | 'upcoming';
  totalFunding: string;
  projectCount: number;
  voterCount: number;
  startDate: string;
  endDate: string;
  resultsDate: string;
  categories: string[];
  eligibilityCriteria: string[];
  keyStats: {
    averageFunding: string;
    topFunding: string;
    participationRate: string;
    communityVotes: number;
  };
}

interface RetroPGFStats {
  totalRounds: number;
  totalFunding: string;
  totalProjects: number;
  activeVoters: number;
  currentRound: RetroPGFRound;
  upcomingDeadlines: Array<{
    date: string;
    event: string;
    description: string;
  }>;
  categoryDistribution: Record<string, {
    projectCount: number;
    totalFunding: string;
    percentage: string;
  }>;
  impactSummary: {
    usersImpacted: string;
    protocolsBuilt: number;
    toolsCreated: number;
    developersSupported: number;
  };
}

// RetroPGF Tracking API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const projectId = searchParams.get('projectId');
    const round = searchParams.get('round');
    const category = searchParams.get('category');

    switch (action) {
      case 'overview':
        const stats = await getRetroPGFStats();
        return NextResponse.json({ success: true, data: stats });

      case 'project':
        if (!projectId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Project ID required' 
          }, { status: 400 });
        }
        const project = await getProjectDetails(projectId);
        return NextResponse.json({ success: true, data: project });

      case 'projects':
        const projects = await getProjects(category, round);
        return NextResponse.json({ success: true, data: projects });

      case 'rounds':
        const rounds = await getAllRounds();
        return NextResponse.json({ success: true, data: rounds });

      case 'round':
        if (!round) {
          return NextResponse.json({ 
            success: false, 
            error: 'Round number required' 
          }, { status: 400 });
        }
        const roundData = await getRoundDetails(parseInt(round));
        return NextResponse.json({ success: true, data: roundData });

      case 'leaderboard':
        const leaderboard = await getFundingLeaderboard(round);
        return NextResponse.json({ success: true, data: leaderboard });

      case 'categories':
        const categories = await getCategoryBreakdown();
        return NextResponse.json({ success: true, data: categories });

      case 'impact':
        const impact = await getImpactMetrics();
        return NextResponse.json({ success: true, data: impact });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('RetroPGF tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RetroPGF data'
    }, { status: 500 });
  }
}

async function getRetroPGFStats(): Promise<RetroPGFStats> {
  return {
    totalRounds: 5,
    totalFunding: '56.5M OP',
    totalProjects: 2847,
    activeVoters: 156,
    currentRound: await getRoundDetails(5),
    upcomingDeadlines: [
      {
        date: '2025-03-15',
        event: 'Project Application Deadline',
        description: 'Final deadline for RetroPGF 5 project submissions'
      },
      {
        date: '2025-04-01',
        event: 'Voting Period Starts',
        description: 'Community voting opens for Round 5 projects'
      },
      {
        date: '2025-04-30',
        event: 'Voting Ends',
        description: 'Final day to cast votes for RetroPGF 5'
      },
      {
        date: '2025-05-15',
        event: 'Results Announcement',
        description: 'RetroPGF 5 funding results published'
      }
    ],
    categoryDistribution: {
      'DeFi': { projectCount: 124, totalFunding: '8.7M OP', percentage: '15.4%' },
      'Infrastructure': { projectCount: 89, totalFunding: '12.3M OP', percentage: '21.8%' },
      'Tooling': { projectCount: 156, totalFunding: '9.8M OP', percentage: '17.3%' },
      'Education': { projectCount: 78, totalFunding: '4.2M OP', percentage: '7.4%' },
      'Community': { projectCount: 234, totalFunding: '11.1M OP', percentage: '19.6%' },
      'Governance': { projectCount: 45, totalFunding: '5.4M OP', percentage: '9.5%' },
      'Developer Tools': { projectCount: 67, totalFunding: '5.0M OP', percentage: '8.8%' }
    },
    impactSummary: {
      usersImpacted: '12.8M+',
      protocolsBuilt: 1247,
      toolsCreated: 892,
      developersSupported: 45000
    }
  };
}

async function getRoundDetails(roundNumber: number): Promise<RetroPGFRound> {
  const rounds = {
    5: {
      round: 5,
      name: 'RetroPGF 5: Ecosystem Growth',
      status: 'active' as const,
      totalFunding: '15M OP',
      projectCount: 501,
      voterCount: 156,
      startDate: '2025-02-01',
      endDate: '2025-04-30',
      resultsDate: '2025-05-15',
      categories: ['DeFi', 'Infrastructure', 'Tooling', 'Education', 'Community', 'Governance', 'Developer Tools'],
      eligibilityCriteria: [
        'Project launched before December 1, 2024',
        'Demonstrable impact on Optimism ecosystem',
        'Open source or public good nature',
        'No conflicts of interest with badgeholders'
      ],
      keyStats: {
        averageFunding: '29,940 OP',
        topFunding: '750K OP',
        participationRate: '78.4%',
        communityVotes: 12847
      }
    },
    4: {
      round: 4,
      name: 'RetroPGF 4: Onchain Summer Impact',
      status: 'completed' as const,
      totalFunding: '10M OP',
      projectCount: 343,
      voterCount: 145,
      startDate: '2024-08-01',
      endDate: '2024-10-15',
      resultsDate: '2024-11-01',
      categories: ['DeFi', 'Infrastructure', 'Community', 'Education'],
      eligibilityCriteria: [
        'Contributed to Onchain Summer success',
        'Built on Optimism or supported ecosystem growth',
        'Measurable impact metrics'
      ],
      keyStats: {
        averageFunding: '29,154 OP',
        topFunding: '500K OP', 
        participationRate: '82.1%',
        communityVotes: 9834
      }
    }
  };

  return rounds[roundNumber as keyof typeof rounds] || rounds[5];
}

async function getProjectDetails(projectId: string): Promise<RetroPGFProject> {
  // Mock project data - in production this would fetch real data
  const mockProjects = {
    'superchain-explorer': {
      id: 'superchain-explorer',
      name: 'Superchain L2 Explorer',
      description: 'Professional-grade DeFi analytics platform with AI-powered insights across 6 L2 networks. Open source alternative to paid tools.',
      category: 'Tooling' as const,
      website: 'https://superchain-token-explorer.xyz',
      github: 'https://github.com/serayd61/Superchain-token-explorer',
      twitter: 'https://twitter.com/superchain_exp',
      fundingReceived: '125K OP',
      roundsParticipated: [4, 5],
      impactMetrics: {
        usersServed: 12000,
        transactionsEnabled: 850000,
        protocolsSupported: 50,
        developersHelped: 245
      },
      badges: ['Open Source', 'DeFi Analytics', 'Multi-Chain', 'AI-Powered'],
      lastUpdated: new Date().toISOString()
    },
    'velodrome': {
      id: 'velodrome',
      name: 'Velodrome Finance',
      description: 'Optimism native AMM designed as a central liquidity hub. Vote-escrowed governance model.',
      category: 'DeFi' as const,
      website: 'https://velodrome.finance',
      github: 'https://github.com/velodrome-finance',
      twitter: 'https://twitter.com/VelodromeFinance',
      fundingReceived: '750K OP',
      roundsParticipated: [3, 4, 5],
      impactMetrics: {
        usersServed: 45000,
        transactionsEnabled: 2800000,
        protocolsSupported: 120,
        developersHelped: 89
      },
      badges: ['Native AMM', 'High TVL', 'Ecosystem Hub', 'Governance Innovation'],
      lastUpdated: new Date().toISOString()
    }
  };

  return mockProjects[projectId as keyof typeof mockProjects] || mockProjects['superchain-explorer'];
}

async function getProjects(category?: string | null, round?: string | null): Promise<RetroPGFProject[]> {
  const allProjects = [
    await getProjectDetails('superchain-explorer'),
    await getProjectDetails('velodrome')
  ];

  let filteredProjects = allProjects;

  if (category) {
    filteredProjects = filteredProjects.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (round) {
    const roundNum = parseInt(round);
    filteredProjects = filteredProjects.filter(p => 
      p.roundsParticipated.includes(roundNum)
    );
  }

  return filteredProjects;
}

async function getAllRounds(): Promise<RetroPGFRound[]> {
  return [
    await getRoundDetails(5),
    await getRoundDetails(4),
    await getRoundDetails(3),
    await getRoundDetails(2),
    await getRoundDetails(1)
  ];
}

async function getFundingLeaderboard(round?: string | null) {
  const leaderboard = [
    { rank: 1, project: 'Velodrome Finance', funding: '750K OP', category: 'DeFi' },
    { rank: 2, project: 'Optimism Gateway', funding: '500K OP', category: 'Infrastructure' },
    { rank: 3, project: 'OP Chains Dashboard', funding: '350K OP', category: 'Tooling' },
    { rank: 4, project: 'Optimism University', funding: '280K OP', category: 'Education' },
    { rank: 5, project: 'DeFi Pulse Tracker', funding: '245K OP', category: 'DeFi' },
    { rank: 6, project: 'Superchain Explorer', funding: '125K OP', category: 'Tooling' },
    { rank: 7, project: 'OP Community Hub', funding: '98K OP', category: 'Community' },
    { rank: 8, project: 'Bridge Monitor', funding: '87K OP', category: 'Infrastructure' },
    { rank: 9, project: 'Governance Tools', funding: '76K OP', category: 'Governance' },
    { rank: 10, project: 'Developer SDK', funding: '65K OP', category: 'Developer Tools' }
  ];

  return {
    round: round || '5',
    totalProjects: 501,
    totalFunding: '15M OP',
    leaderboard
  };
}

async function getCategoryBreakdown() {
  const stats = await getRetroPGFStats();
  return stats.categoryDistribution;
}

async function getImpactMetrics() {
  return {
    totalImpact: {
      usersServed: '12.8M+',
      transactionsEnabled: '450M+',
      protocolsSupported: '1,247',
      developersHelped: '45,000+'
    },
    topImpactProjects: [
      {
        name: 'Optimism Bridge',
        impact: '8.2M users served',
        category: 'Infrastructure'
      },
      {
        name: 'Velodrome Finance', 
        impact: '180M transactions enabled',
        category: 'DeFi'
      },
      {
        name: 'OP Dev Tools',
        impact: '12,000 developers helped',
        category: 'Developer Tools'
      }
    ],
    growthMetrics: {
      userGrowth: '+145%',
      protocolGrowth: '+89%',
      developerGrowth: '+67%',
      fundingGrowth: '+234%'
    }
  };
}

// POST endpoint for project applications and monitoring
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'apply':
        const application = await submitApplication(params);
        return NextResponse.json({ success: true, data: application });

      case 'vote':
        const vote = await submitVote(params);
        return NextResponse.json({ success: true, data: vote });

      case 'track-impact':
        const tracking = await trackProjectImpact(params);
        return NextResponse.json({ success: true, data: tracking });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('RetroPGF POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}

async function submitApplication(params: any) {
  return {
    applicationId: `app_${Math.random().toString(36).substr(2, 9)}`,
    status: 'submitted',
    reviewPeriod: '14 days',
    nextSteps: [
      'Application review by badgeholders',
      'Community feedback period',
      'Final eligibility confirmation',
      'Voting period participation'
    ],
    estimatedResults: '2025-05-15'
  };
}

async function submitVote(params: any) {
  return {
    voteId: `vote_${Math.random().toString(36).substr(2, 9)}`,
    status: 'recorded',
    votingPower: '1.0',
    contribution: 'Community impact assessment',
    timestamp: new Date().toISOString()
  };
}

async function trackProjectImpact(params: any) {
  return {
    projectId: params.projectId,
    trackingEnabled: true,
    metrics: ['users', 'transactions', 'protocols', 'developers'],
    reportingFrequency: 'weekly',
    nextReport: new Date(Date.now() + 604800000).toISOString() // 1 week
  };
}