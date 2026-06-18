import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import { getActivityActionLabel, getActivitySummary, listRecentActivityLogs } from '../../services/activityLogService';
import { listPendingRelationshipChangeRequests } from '../../services/relationshipChangeRequestService';
import { adminListProfilesForLinking } from '../../services/memberProfileService';
import { ActivityLog } from '../../types';
export function AdminDashboard() { return <div />; }
