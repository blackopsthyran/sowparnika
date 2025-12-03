// @ts-nocheck
import React from 'react';
import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
    graphs: {
        typeDistribution: Array<{ name: string; value: number }>;
        priceDistribution: Array<{ name: string; value: number }>;
    };
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ graphs }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (!graphs) return null;

    return (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Box height="350px" p={4} border="1px solid" borderColor="gray.100" borderRadius="md">
                <Text
                    fontSize="sm"
                    fontWeight="600"
                    mb={4}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    textAlign="center"
                    color="gray.700"
                >
                    Property Types
                </Text>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={graphs.typeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {graphs.typeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            <Box height="350px" p={4} border="1px solid" borderColor="gray.100" borderRadius="md">
                <Text
                    fontSize="sm"
                    fontWeight="600"
                    mb={4}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    textAlign="center"
                    color="gray.700"
                >
                    Price Distribution
                </Text>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={graphs.priceDistribution}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={10} tick={{ fill: '#4A5568' }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#4A5568' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0088FE" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </SimpleGrid>
    );
};

export default DashboardCharts;
